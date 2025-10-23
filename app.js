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
    const plyContent = buildPLY(vertices, faces);

    // Écriture du fichier
    fs.writeFileSync('./data/output.ply', plyContent, 'utf8');
    console.log('Fichier output.ply généré avec succès !');

  } catch (error) {
    console.error('Erreur lors de la lecture des fichiers :', error);
  }
}

// Exemple de fonction de traitement
function buildPLY(vertices, faces) {
  console.log('Nombre de vertices :', vertices.length);
  console.log('Nombre de faces :', faces.length);
  
  let header = `ply
  format ascii 1.0
  element vertex ${vertices.length}
  property float x
  property float y
  property float z
  element face ${faces.length}
  property list uchar int vertex_indices
  end_header`;

  console.log(header);

  // les vertex sont deja formattees correctement. Pour les faces on doit ajouter le nombre de vertices (3 pour un triangle)
  const vertexLines = vertices.map(v => v.join(' '));
  const faceLines = faces.map(f => {
    // On anticipe le cas où les valeurs sont chargees comme des strings ["14","12","13"]
    const indices = f.map(Number);
    return `${indices.length} ${indices.join(' ')}`;
  });

  // on asssemble le tout
  return [header, ...vertexLines, ...faceLines].join('\n');
}

main();
