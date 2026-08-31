const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Autenticación con la API de Google Sheets
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);

// Ruta para probar que la API está activa
app.get('/', (req, res) => {
  res.send('API de Asistencias Bizarro Restaurante ejecutándose.');
});

// Registrar entrada/salida de asistencia
app.post('/api/asistencia', async (req, res) => {
  try {
    const { codigoEmpleado } = req.body;
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Asistencias'] || doc.sheetsByIndex[0];

    await sheet.addRow({
      Codigo: codigoEmpleado,
      FechaHora: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })
    });

    res.json({ status: 'success', message: 'Asistencia registrada correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));