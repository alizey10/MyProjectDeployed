import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url'; 
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools';
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils';
import riJson from '@iconify/json/json/ri.json';
import lineMdJson from '@iconify/json/json/line-md.json';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sources = {
  json: [
    riJson,
    { filename: lineMdJson, icons: ['home-twotone-alt','github','document-list','document-code','image-twotone'] }
  ],
  icons: ['bx-basket','bi-airplane-engines','tabler-anchor','uit-adobe-alt','twemoji-auto-rickshaw'],
  svg: []
};

const target = join(__dirname, 'generated-icons.css');

;(async function () {
  const allIcons = [];


  const dir = dirname(target);
  await fs.mkdir(dir, { recursive: true }).catch(() => {});

  
  if (sources.icons) {
    const sourcesJSON = sources.json ? sources.json : (sources.json = []);
    const organizedList = organizeIconsList(sources.icons);

    for (const prefix in organizedList) {
      sourcesJSON.push({
        filename: riJson,
        icons: organizedList[prefix]
      });
    }
  }


  for (const item of sources.json) {
    const content = item.icons ? getIcons(item.filename, item.icons) : item.filename;
    allIcons.push(content);
  }

  for (const source of sources.svg) {
    const iconSet = await importDirectory(source.dir, { prefix: source.prefix });

    await iconSet.forEach(async (name, type) => {
      if (type !== 'icon') return;

      const svg = iconSet.toSVG(name);
      if (!svg) {
        iconSet.remove(name);
        return;
      }

      try {
        await cleanupSVG(svg);

        if (source.monotone) {
          await parseColors(svg, {
            defaultColor: 'currentColor',
            callback: (attr, colorStr, color) => (!color || isEmptyColor(color) ? colorStr : 'currentColor')
          });
        }

        await runSVGO(svg);
      } catch (err) {
        console.error(`Error parsing ${name} from ${source.dir}:`, err);
        iconSet.remove(name);
        return;
      }

      iconSet.fromSVG(name, svg);
    });

    allIcons.push(iconSet.export());
  }

  const cssContent = allIcons
    .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), { iconSelector: '.{prefix}-{name}' }))
    .join('\n');

  await fs.writeFile(target, cssContent, 'utf8');

})().catch(console.error);


function organizeIconsList(icons) {
  const sorted = {};
  for (const icon of icons) {
    const item = stringToIcon(icon);
    if (!item) continue;
    const { prefix, name } = item;
    if (!sorted[prefix]) sorted[prefix] = [];
    if (!sorted[prefix].includes(name)) sorted[prefix].push(name);
  }
  return sorted;
}
