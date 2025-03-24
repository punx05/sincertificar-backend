
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/denunciar', upload.array('archivos'), async (req, res) => {
  try {
    const {
      producto,
      marca,
      modelo,
      importador,
      puntoVenta,
      link,
      correo,
      captcha
    } = req.body;

    if (!producto || !marca || !modelo || !puntoVenta || !captcha || captcha.trim().toUpperCase() !== 'HUMANO' || !req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Faltan campos obligatorios o captcha incorrecto' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Nueva denuncia desde sincertificar.com.ar',
      text: `
Producto: ${producto}
Marca: ${marca}
Modelo: ${modelo}
Importador/Fabricante: ${importador}
Punto de venta: ${puntoVenta}
Link publicación: ${link}
Correo de contacto: ${correo || 'No informado'}
      `,
      attachments: req.files.map((file, i) => ({
        filename: file.originalname || `archivo_${i + 1}`,
        content: file.buffer
      }))
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Denuncia enviada con éxito' });
  } catch (error) {
    console.error('Error al procesar la denuncia:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
