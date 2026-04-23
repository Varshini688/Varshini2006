const Pet = require('../Model/PetModel');
const fs = require('fs');
const path = require('path');

const buildGalleryPets = () => {
  const imagesDir = path.join(__dirname, '../images');

  if (!fs.existsSync(imagesDir)) {
    return [];
  }

  return fs.readdirSync(imagesDir).map((filename) => {
    const filePath = path.join(imagesDir, filename);
    const fileStats = fs.statSync(filePath);
    const name = path.parse(filename).name;

    return {
      _id: filename,
      name,
      age: 'Unknown',
      area: 'Available for adoption',
      justification: 'Pet image available in the gallery.',
      email: '',
      phone: '',
      type: 'Unknown',
      filename,
      status: 'Approved',
      updatedAt: fileStats.mtime,
    };
  });
};

const postPetRequest = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name, age, area, justification, email, phone, type } = req.body;
    const filename = req.file.filename;

    const pet = await Pet.create({
      name,
      age,
      area,
      justification,
      email,
      phone,
      type,
      filename,
      status: 'Pending'
    });

    res.status(200).json(pet);
  } catch (error) {
    console.error('Error in postPetRequest:', error);
    res.status(500).json({ error: error.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, phone, status } = req.body;
    const pet = await Pet.findByIdAndUpdate(id, { email, phone, status }, { new: true });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.status(200).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const allPets = async (reqStatus, req, res) => {
  try {
    const data = await Pet.find({ status: reqStatus }).sort({ updatedAt: -1 });

    if (reqStatus === 'Approved' && req.query.gallery === 'true' && data.length === 0) {
      return res.status(200).json(buildGalleryPets());
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const pet = await Pet.findByIdAndDelete(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    const filePath = path.join(__dirname, '../images', pet.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  postPetRequest,
  approveRequest,
  deletePost,
  allPets
};
