const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generar JWT Token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// Registro de Usuario
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, country } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        user = new User({ name, email, password, role, country });

        await user.save();

        const token = generateToken(user);

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Login de Usuario
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Credenciales incorrectas' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales incorrectas' });
        }

        const token = generateToken(user);

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Subir imagen de perfil
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Por favor sube una imagen' });
        }

        const user = await User.findById(req.user.id);

        user.profileImage = req.file.path;  // Guardar la ruta de la imagen en el campo profileImage
        await user.save();

        res.json({ msg: 'Imagen subida correctamente', profileImage: user.profileImage });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }};
