import ncc from '@vercel/ncc';
import fs from 'fs';
import path from 'path';

const actionsPath = path.resolve(process.cwd(), './.github/actions');

const run = async () => {
  const dirs = fs.readdirSync(actionsPath);

  dirs.map(async (d) => {
    const [input, output] = ['index.js', 'index.dist.js'].map((n) =>
      path.resolve(actionsPath, d, n)
    );

    if (fs.existsSync(input)) {
      const { code } = await ncc(input, {
        // minify: true,
      });

      fs.writeFileSync(output, code);
    }
  });
};

run();
