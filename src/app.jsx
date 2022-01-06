import JSZip from "jszip";
import { useRef, useState } from "react";
import { Recipe } from "./recipe";

const DECLARATION_PATTERN = /\<\?xml(.*)\?\>/;
/**
 * 
 * @param {string} xmlString 
 * @returns 
 */
const parseXML = (xmlString) => {
  const match = xmlString.match(DECLARATION_PATTERN);
  xmlString = xmlString.replace(match[0], match[0].replace('standalone="yes"', ''));
  const domParser = new DOMParser();
  return domParser.parseFromString(xmlString, "text/xml");
}


const readBlob = (blob, encoding) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.readAsText(blob,encoding);
})

const convertBlobToDataURL = (blob) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.readAsDataURL(blob);
})

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = async (a) => {
    resolve(a);
  };
  reader.onerror = async (e) => {
    reject(e);
  } 
  reader.readAsArrayBuffer(file);
})

export function App() {
  const fileRef = useRef();
  const [recipes, setRecipes] = useState([]);
  const [assets, setAssets] = useState({});

  const onFileChange = async (e) => {
    try {
    const [file] = e.target.files;

    if (!file) {
      setRecipes([]);
      setAssets({});
      return;
    }

    const a = await readFile(file);
    const binary = a.target.result;
    const data = await JSZip.loadAsync(binary);

    const fileNames = Object.keys(data.files);
    const recipeFiles = fileNames.filter( a => {
      const parts = a.split('.');
      const ext = parts[parts.length - 1];
      return ext.toLocaleLowerCase() === 'mx2';
    })


    const packageAssets = {};
    const packageRecipes = [];

    for (let fileName of fileNames) {
      const file = data.files[fileName];
      if (recipeFiles.includes(fileName)) {
        const xmlBlob = await file.async('blob');
        const xmlString = await readBlob(xmlBlob, 'ISO-8859-9');
        packageRecipes.push(parseXML(xmlString));
      } else {
        const asset = await convertBlobToDataURL(await file.async('blob'));
        packageAssets[fileName] = asset;
      }
    }

    setRecipes(packageRecipes);
    setAssets(packageAssets);
    setIsFailed(false);
    } catch (e) {
      setIsFailed(true);
      setRecipes([]);
      setAssets({});
    }
  }

  const [isDragging, setIsDragging] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const onDragStart = () => {
    setIsDragging(true);
  };
  const onDragEnd = () => {
    setIsDragging(false);
  };

  return <>
    <div className={`dragzoneWrapper ${isDragging ? 'isDragging' : ''}`}>
      <div className="dragzone" onDragOver={onDragStart} onDragEnter={onDragStart} onDragLeave={onDragEnd} onDragEnd={onDragEnd} onDrop={onDragEnd} >
        <p>ℹ️ <span className="tag">.mz2</span> dosyalarını görüntülemek için buraya tıklayın veya dosyayı sürükleyip bırakın.</p>
        <input type="file" ref={fileRef} onChange={onFileChange} accept=".mz2" />
      </div>
    </div>
    {isFailed && (
      <div className="error">
        ⛔️ Reçete dosyası okunurken bir hata oluştu
      </div>
    )}
    {recipes.map((recipe, i) => <Recipe key={i} recipe={recipe} assets={assets} />)}
  </>;
}