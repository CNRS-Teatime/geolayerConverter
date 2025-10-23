import fs from 'fs';
import { parse } from 'csv-parse';

// Fonction pour lire un fichier CSV et retourner une promesse
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ';', columns: false, skip_empty_lines: true }))
      .on('data', (row) => {
        records.push(row);
      })
      .on('end', () => {
        resolve(records);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

// Fonction principale
async function main() {
  try {
    // Lecture parallèle des deux fichiers
    const [vertices, faces] = await Promise.all([
      readCSV('./data/mon_fichier_vertice_sim20250313_a_0.csv'),
      readCSV('./data/mon_fichier_sim20250313_a_0.csv')
    ]);

    // Appel de la fonction de traitement
    process(vertices, faces);
  } catch (error) {
    console.error('Erreur lors de la lecture des fichiers :', error);
  }
}

// Exemple de fonction de traitement
function process(vertices, faces) {
  console.log('Nombre de vertices :', vertices.length);
  console.log('Nombre de faces :', faces.length);
  console.log('Premier vertex :')
  console.log(vertices[0]);
  console.log('Première face :', faces[0]);
  // ... ton code ici ...

  let header = `ply
  format ascii 1.0
  element vertex ${vertices.length + 1}
  property float x
  property float y
  property float z
  element face ${faces.length + 1}
  property list uchar int vertex_indices
  end_header`;

  console.log(header);
}

main();
