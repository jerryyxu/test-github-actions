const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const actionsPath = path.resolve(process.cwd(), './.github/actions');

const run = async () => {
  const dirs = fs.readdirSync(actionsPath);

  dirs.map(async (d) => {
    const [input, dir] = ['index.js', 'dist'].map((f) =>
      path.join(actionsPath, d, f)
    );

    if (fs.existsSync(input)) {
      exec(`ncc build ${input} -o ${dir}`);
    }
  });

  console.log('>>>> build finished.');
};

run();
