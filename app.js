import fs from 'fs';
import { parse } from 'csv-parse';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';


const optionDefinitions = [
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Display this usage guide."
  },
  {
    name: 'vertices',
    type: String,
    description: 'Path to CSV vertices file'
  },
  {
    name: 'faces',
    type: String,
    description: 'Path to CSV faces file'
  },
  {
    name: 'output',
    type: String,
    description: 'Optional. Path to output PLY file.'
  }
]

const options = commandLineArgs(optionDefinitions);
const usage = commandLineUsage([
  {
    header: 'An app to build a PLY file from CSVs.',
    content: 'This app aims to build a PLY file from two CSV files (one for vertices, the other with faces). Example: node app.js --vertices "./data/vertices.csv" --faces "./data/faces.csv" --output "./results.ply"'
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  },
  {
    content: 'Project home: {underline https://github.com/CNRS-Teatime/geolayerConverter/}'
  }
]);

// if no arg, display usage guide (by default, are test (multithesaurus inclusion, homonymy, thesauri/aioli inclusion) are set on false)
if (options.help || (!options.vertices && !options.faces)){
  console.log(usage);
}
else {
  main(options.vertices, options.faces, options.output);
}

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
async function main(verticesPath, facesPath, outputPath="./data/output.ply") {
  console.log(verticesPath);
  console.log(facesPath);
  console.log(outputPath);

  try {
    // Lecture parallèle des deux fichiers
    const [vertices, faces] = await Promise.all([
      readCSV(verticesPath),
      readCSV(facesPath)
    ]);

    // Appel de la fonction de traitement
    const plyContent = buildPLY(vertices, faces);

    // Écriture du fichier
    fs.writeFileSync(outputPath, plyContent, 'utf8');
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
