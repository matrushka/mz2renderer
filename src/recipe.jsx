/**
 * @param {HTMLElement} root 
 */
const parseTitle = (root) => {
  return root.querySelector('Summ Nam').textContent;
}

/**
 * @param {HTMLElement} root 
 */
const parseRecipeImage = (root) => {
  return root.querySelector('RcpE').getAttribute('img');
}

/**
 * @param {HTMLElement} root 
 */
const parseIngredients = (root) => {
  return Array.from(root.querySelectorAll('IngR')).map(node => {
    const name = node.getAttribute('name');
    const unit = node.getAttribute('unit');
    const code = node.getAttribute('code');
    const qty = node.getAttribute('qty');

    const prep = Array.from(node.querySelectorAll('IPrp')).map(prepNode => {
      const prepText = prepNode.textContent;
      const prepImage = prepNode.getAttribute('img');
      return { text: prepText, image: prepImage ? assets[prepImage] : null  };
    });

    return { 
      name,
      unit,
      qty,
      code,
      prep,
    }
  })
}

/**
 * @param {HTMLElement} root 
 */
const parseDirections = (root) => {
  return Array.from(root.querySelectorAll('DirS DirT')).map(node => {
    const text = node.textContent;
    const image = node.getAttribute('img');
    return { text: text, image: image ? assets[image] : null };
  })
}

/**
 * @param {HTMLElement} root 
 */
const parseNutritions = (root) => {
  return Array.from(root.querySelectorAll('Nutr')).map(node => {
    const text = node.textContent;
    const image = node.getAttribute('img');
    return { text: text, image: image ? assets[image] : null };
  })
}


/**
 * @param {HTMLElement} root 
 */
const parseDescriptions = (root) => {
  return Array.from(root.querySelectorAll('Desc')).map(node => {
    const text = node.textContent;
    const image = node.getAttribute('img');
    return { text: text, image: image ? assets[image] : null };
  })
}

const nl2br = (str, is_xhtml) => {
  if (typeof str === 'undefined' || str === null) {
    return '';
  }
  const breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

export function Recipe({ assets, recipe}) {
  /**
   * @type {HTMLElement} 
   * */
  const root = recipe.querySelector('mx2');
  const title = parseTitle(root);
  const image = parseRecipeImage(root);

  const ingredients = parseIngredients(root);
  const directions = parseDirections(root);
  const descriptions = parseDescriptions(root);
  const nutritions = parseNutritions(root);

  return <div className="recipe">
    <h1>{title}</h1>
    {image && <img src={assets[image]} />}
    <ul className="ingredients">
    {ingredients.map((ingredient) => (
      <li>
        {ingredient.qty} {ingredient.unit} {ingredient.name}
        {ingredient.prep.map(prep => (
          <>
          {prep.image && <img src={assets[prep.image]} />}
          <p>{prep.text}</p>
          </>
        ))}
      </li>
    ))}
    </ul>
    <div className="directions">
      {directions.map((direction) => (
        <>
          {direction.image && <img src={assets[direction.image]} />}
          <div dangerouslySetInnerHTML={{ __html: nl2br(direction.text) }} />
        </>
      ))}
    </div>
    <div className="description">
      {descriptions.map((description) => (
        <>
          {description.image && <img src={assets[description.image]} />}
          <div dangerouslySetInnerHTML={{ __html: nl2br(description.text) }} />
        </>
      ))}
    </div>
    <div className="nutrition">
      {nutritions.map((nutrition) => (
        <>
          {nutrition.image && <img src={assets[nutrition.image]} />}
          <div dangerouslySetInnerHTML={{ __html: nl2br(nutrition.text) }} />
        </>
      ))}
    </div>
  </div>;
}