### About
This simple app process two CSV files to build a PLY (ascii). The goal is to ease the analysis of geological layers for Galeri3 project.

### Usage

```bash
npm install

# to get the helper
npm start

# to process files
node app.js --vertices "./path/to/vertices/file.csv" --faces "./path/to/faces/file.csv" --output "./path/to/save/the/output/file.ply"
```

### Example

```bash
node app.js --vertices "./data/mon_fichier_vertice_sim20250313_a_0.csv" --faces "./data/mon_fichier_sim20250313_a_0.csv"
```

The output argument is optional. If not set, the output file will be saved in the data folder: ./data/output.ply
