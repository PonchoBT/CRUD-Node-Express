const express = require('express');
const router = express.Router();
const Item = require('../models/item');

// Middleware para validar ID
const validarId = async (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  next();
};

// Middleware para validar datos del item
const validarItem = (req, res, next) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      error: 'Datos incompletos',
      detalles: {
        name: !name ? 'El nombre es requerido' : null,
        description: !description ? 'La descripción es requerida' : null
      }
    });
  }

  if (name.length < 3 || name.length > 50) {
    return res.status(400).json({
      error: 'El nombre debe tener entre 3 y 50 caracteres'
    });
  }

  if (description.length < 10 || description.length > 500) {
    return res.status(400).json({
      error: 'La descripción debe tener entre 10 y 500 caracteres'
    });
  }

  req.body.name = name.trim();
  req.body.description = description.trim();
  next();
};

// @route   GET api/items
// @desc    Obtener todos los items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const items = await Item.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Item.countDocuments();
    
    res.json({
      items,
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error al obtener items:', err);
    res.status(500).json({ error: 'Error al obtener los items' });
  }
});

// @route   POST api/items
// @desc    Crear un nuevo item
// @access  Public
router.post('/', validarItem, async (req, res) => {
  try {
    const itemExistente = await Item.findOne({ name: req.body.name });
    if (itemExistente) {
      return res.status(400).json({ error: 'Ya existe un item con este nombre' });
    }

    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    
    res.status(201).json({
      mensaje: 'Item creado exitosamente',
      item: savedItem
    });
  } catch (err) {
    console.error('Error al crear item:', err);
    res.status(500).json({ error: 'Error al crear el item' });
  }
});

// @route   GET api/items/:id
// @desc    Obtener un item por ID
// @access  Public
router.get('/:id', validarId, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error al obtener item:', err);
    res.status(500).json({ error: 'Error al obtener el item' });
  }
});

// @route   PUT api/items/:id
// @desc    Actualizar un item
// @access  Public
router.put('/:id', [validarId, validarItem], async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    res.json({
      mensaje: 'Item actualizado exitosamente',
      item
    });
  } catch (err) {
    console.error('Error al actualizar item:', err);
    res.status(500).json({ error: 'Error al actualizar el item' });
  }
});

// @route   DELETE api/items/:id
// @desc    Eliminar un item
// @access  Public
router.delete('/:id', validarId, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    res.json({
      mensaje: 'Item eliminado exitosamente',
      item
    });
  } catch (err) {
    console.error('Error al eliminar item:', err);
    res.status(500).json({ error: 'Error al eliminar el item' });
  }
});

module.exports = router;
