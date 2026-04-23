import React, { useEffect, useState } from "react";
import PetsViewer from "./PetsViewer";

const Pets = () => {
  const [filter, setFilter] = useState("all");
  const [petsData, setPetsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:4000/approvedPets')
        const data = await response.json()
        if (response.ok) {
          if (data.length > 0) {
            setPetsData(data)
          } else {
            const galleryResponse = await fetch('http://localhost:4000/approvedPets?gallery=true')
            const galleryData = await galleryResponse.json()
            setPetsData(galleryResponse.ok ? galleryData : [])
          }
        } else {
          console.log('Error fetching pets:', data.error)
          const galleryResponse = await fetch('http://localhost:4000/approvedPets?gallery=true')
          const galleryData = await galleryResponse.json()
          setPetsData(galleryResponse.ok ? galleryData : [])
        }
      } catch (error) {
        console.log('Fetch error:', error)
        try {
          const galleryResponse = await fetch('http://localhost:4000/approvedPets?gallery=true')
          const galleryData = await galleryResponse.json()
          setPetsData(galleryResponse.ok ? galleryData : [])
        } catch (galleryError) {
          console.log('Gallery fetch error:', galleryError)
          setPetsData([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRequests();
  }, [])

  const filteredPets = petsData.filter((pet) => {
    if (filter === "all") {
      return true;
    }
    return pet.type === filter;
  });

  return (
    <>
      <div className="filter-selection">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All Pets</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
          <option value="Rabbit">Rabbits</option>
          <option value="Bird">Birds</option>
          <option value="Fish">Fishs</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="pet-container">
        {loading ?
          <p>Loading</p> : ((filteredPets.length > 0 ) ? (
            filteredPets.map((petDetail, index) => (
              <PetsViewer pet={petDetail} key={index} />
            ))
          ) : (
            <p className="oops-msg">Oops!... No pets available</p>
          )
          )
        }
      </div>
    </>
  );
};

export default Pets;
