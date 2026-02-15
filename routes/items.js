const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const { ITEM_LIMITS } = require('../constants/item');
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// Middleware para validar ID
const validarId = (req, res, next) => {
  if (!OBJECT_ID_REGEX.test(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  next();
};

// Middleware para validar datos del item
const validarItem = (req, res, next) => {
  const name = req.body.name?.trim();
  const description = req.body.description?.trim();

  if (!name || !description) {
    return res.status(400).json({
      error: 'Datos incompletos',
      detalles: {
        name: !name ? 'El nombre es requerido' : null,
        description: !description ? 'La descripción es requerida' : null
      }
    });
  }

  if (name.length < ITEM_LIMITS.name.min || name.length > ITEM_LIMITS.name.max) {
    return res.status(400).json({
      error: `El nombre debe tener entre ${ITEM_LIMITS.name.min} y ${ITEM_LIMITS.name.max} caracteres`
    });
  }

  if (description.length < ITEM_LIMITS.description.min || description.length > ITEM_LIMITS.description.max) {
    return res.status(400).json({
      error: `La descripción debe tener entre ${ITEM_LIMITS.description.min} y ${ITEM_LIMITS.description.max} caracteres`
    });
  }

  req.body.name = name;
  req.body.description = description;
  next();
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

const getPagination = (query) => {
  const page = parsePositiveInt(query.page, DEFAULT_PAGE);
  const requestedLimit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  return { page, limit };
};

const handleServerError = (res, message, err) => {
  console.error(message, err);
  return res.status(500).json({ error: message });
};

// @route   GET api/items
// @desc    Obtener todos los items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page, limit } = getPagination(req.query);
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
    return handleServerError(res, 'Error al obtener los items', err);
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
    return handleServerError(res, 'Error al crear el item', err);
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
    return handleServerError(res, 'Error al obtener el item', err);
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
    return handleServerError(res, 'Error al actualizar el item', err);
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
    return handleServerError(res, 'Error al eliminar el item', err);
  }
});

module.exports = router;
