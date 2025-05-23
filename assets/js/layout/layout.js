import { TurndownService } from './turndown.js';

const turndownService = new TurndownService();

const properties = ["width", "col", "printwidth", "printcol", "printrow", "printheight", "printvalign"];
const labels = {
  "col": "Col. ↦",
  "width": "Width ↔",
  "printcol": "Col. ↦ (print)",
  "printwidth": "Width ↔ (print)",
  "printrow": "Row ↧",
  "printheight": "Height ↕",
  "printvalign": "V Align ↕ "
};

// print mode
if (typeof Paged !== "undefined") {
  Paged.registerHandlers(class extends Paged.Handler {
    constructor(chunker, polisher, caller) {
      super(chunker, polisher, caller);
    }
    afterRendered(pages) {
      pages.forEach(page => {
        layoutHelper(page.element);
      });
    }
  });
} else {
  // screen mode
  layoutHelper(document);
}

function layoutHelper(content) {
  document.body.dataset.mode = 'layout';

  const figures = content.querySelectorAll('.figure, .insert');
  figures.forEach((f) => {
    const nav = document.createElement('nav');
    properties.forEach(prop => {
      const is_print = prop.includes("print");
      const is_width = prop.includes("width");
      const is_height = prop.includes("height");
      const is_row = prop.includes("row");
      const is_valign = prop.includes("valign");
      const val = f.style.getPropertyValue("--" + prop);

      // console.log(is_height);



      const select = document.createElement('select');
      select.className = is_print ? "printoptions" : "screenoptions";

      if (!is_valign) {
        // Détermine les valeurs de départ et de fin en fonction des conditions
        let start = 0;
        let end = 9;

        if (is_width) {
          start = 3;
          end = 12;
        } else if (is_height) {
          start = 1;
          end = 10;
        }else if (is_row) {
          start = 1;
          end = 10;
        }

        for (let i = start; i <= end; i++) {
          const o = document.createElement("option");
          o.value = o.textContent = i;
          if (val == i) {
            o.setAttribute('selected', true);
            f.setAttribute('data-' + prop, val);
          }
          if (i == 0) {
            o.value = o.textContent = "auto";
          }
          select.appendChild(o);
        }
      }

      // if (!is_valign) {
      //   // from 3 to 9 for widths, 0 to 9 for offsets
      //   for (let i = (is_width ? 3 : 0); i <= (is_width ? 12 : 9); i++) {
      //     const o = document.createElement("option");
      //     o.value = o.textContent = i;
      //     if (val == i) {
      //       o.setAttribute('selected', true);
      //       f.setAttribute('data-' + prop, val);
      //     }
      //     if (i == 0) {
      //       o.value = o.textContent = "auto";
      //     }
      //     select.appendChild(o);
      //   }
      // }

      if (is_valign) {
        const options = ["top", "center", "end"];
        options.forEach(option => {
          const o = document.createElement("option");
          o.value = o.textContent = option;
          if (val === option) {
            o.setAttribute('selected', true);
            f.setAttribute('data-' + prop, val);
          }
          select.appendChild(o);
        });
      }

      let p = document.createElement("p");
      p.className = is_print ? "printoptions" : "screenoptions";
      if (prop === "printrow" || prop === "printheight" || prop === "printvalign") {
        p.classList.add("rowoptions");
      }
      p.innerHTML = `<span>${labels[prop]}</span> `;
      p.appendChild(select);
      nav.appendChild(p);
      select.addEventListener("change", function () {
        const v = f.getAttribute('data-' + prop);
        if (checkSum(f, this)) {
          f.style.setProperty(`--${prop}`, this.value);
          f.setAttribute(`data-${prop}`, this.value);

          if (f.classList.contains('codeencart')) {
            layoutHelperLogencart(f);
          } else {
            layoutHelperLog(f);
          }

        } else {
          f.style.setProperty(`--${prop}`, v);
          this.value = v;
          alert("Start-column and width are incompatible (their sum should be ≤ 13).");
          return false;
        }
      });
    });

    const copybtn = document.createElement("button");
    copybtn.textContent = "Copy markdown";
    copybtn.onclick = () => {
      if (f.classList.contains('codeencart')) {
        layoutHelperLogencart(f);
        // console.log(layoutHelperLogencart);
      } else {
        layoutHelperLog(f);
      }
    }
    nav.appendChild(copybtn);
    f.appendChild(nav);
  });
}

function checkSum(f, select) {
  let selects = null, sum = 0;
  if (select.classList.contains("printoptions")) {
    selects = f.querySelectorAll(".printoptions");
  } else {
    selects = f.querySelectorAll(".screenoptions");
  }

  selects.forEach(s => {
    sum += Number(s.value);
  });
  if (sum > 13) {
    return false;
  }
  return true;
}

// function layoutHelperLog(f) {
//   const i = f.querySelector("img");
//   const url = i.getAttribute('src');

//   const is_image = f.classList.contains('image');

//   const fc = f.querySelector("figcaption");
//   let caption = "";
//   if (fc && fc.textContent.trim()) {
//     const clone = fc.cloneNode(true);
//     // remove backlink from icono figures
//     if (!is_image) {
//       const toremove = clone.querySelectorAll('.figure_call_back, .figure_reference');
//       toremove.forEach(e => {
//         e.remove();
//       });
//     }
//     caption = `caption: ${turndownService.turndown(clone.innerHTML)}`
//   }

//   const usefull_classes = f.className.replace(/figure/g, "").replace("icono", "").trim();
//   const classes = usefull_classes ? `class: ${usefull_classes}` : "";

//   var inlinestyles = "";
//   var properties = ["col", "width", "printcol", "printwidth"];
//   properties.forEach(prop => {
//     const val = f.style.getPropertyValue("--" + prop);
//     if (val) {
//       inlinestyles += `${prop}:${val} `;
//     }
//   });

//   let code = `(figure: ${url} ${inlinestyles} ${classes} ${caption})`;
//   if (is_image) code = `(image: ${url} ${inlinestyles} ${classes} ${caption})`;

//   console.log(code);

//   let input = document.createElement('input');
//   input.value = code;
//   if (navigator.clipboard) {
//     copyCode(f, code);
//   } else {
//     input.select();
//     document.execCommand('copy');
//   }
// }

function layoutHelperLogencart(f) {
  var inlinestyles = "";
  var properties = ["printcol", "printwidth", "printrow", "printheight", "printvalign"];
  properties.forEach(prop => {
    const val = f.style.getPropertyValue("--" + prop);
    if (val) {
      inlinestyles += `--${prop}:${val}; `;
    }
  });

  let code = `{.insert style="${inlinestyles}"}`;

  console.log(code);

  let input = document.createElement('input');
  input.value = code;
  if (navigator.clipboard) {
    copyCode(f, code);
  } else {
    input.select();
    document.execCommand('copy');
  }
}

function layoutHelperLog(f) {
  // console.log("codeencart");

  const i = f.querySelector("img");
  const url = i.getAttribute('src');

  const is_image = f.classList.contains('image');
  const is_encart = f.classList.contains('codeencart');
  const is_imagegrid = f.classList.contains('imagegrid');


  const fc = f.querySelector("figcaption");
  let caption = "";
  if (fc && fc.textContent.trim()) {
    const clone = fc.cloneNode(true);
    // remove backlink from icono figures
    if (!is_image) {
      const toremove = clone.querySelectorAll('.figure_call_back, .figure_reference');
      toremove.forEach(e => {
        e.remove();
      });
    }
    caption = `caption: ${turndownService.turndown(clone.innerHTML)}`
  }


  let usefull_classes = "";
  let properties = [];

  if (is_image) {
    properties = ["col", "width", "printcol", "printwidth", "printrow", "printheight", "printvalign"];
    usefull_classes = f.className.replace(/figure/g, "").replace("image", "").replace("icono", "").trim();
  }

  if (is_encart) {
    properties = ["printcol", "printwidth", "printrow", "printheight", "printvalign"];
    usefull_classes = f.className.replace(/insert/g, "").replace("insert", "").replace("row", "").trim();
  }

  if (is_imagegrid) {
    properties = ["printcol", "printwidth", "printrow", "printheight", "printvalign"];
    usefull_classes = f.className.replace(/figure/g, "").replace("imagegrid", "").replace("codeimagegrid", "").trim();
  }

  const classes = usefull_classes ? `class: ${usefull_classes}` : "";

  var inlinestyles = "";

  // console.log(properties);

  properties.forEach(prop => {
    const val = f.style.getPropertyValue("--" + prop);
    if (val) {
      inlinestyles += `${prop}:${val} `;
    }
  });

  let code = "";

  if (is_image) {
    code = `(image: ${url} ${inlinestyles} ${classes} ${caption})`;
  } else if  (is_encart) {
    code = `(insert: ${url} ${inlinestyles} ${classes} ${caption})`;
  } else if  (is_imagegrid) {
    code = `(imagegrid: ${url} ${inlinestyles} ${classes} ${caption})`;
  } else {
    code = `(figure: ${url} ${inlinestyles} ${classes} ${caption})`;
  }

  console.log(code);

  let input = document.createElement('input');
  input.value = code;
  if (navigator.clipboard) {
    copyCode(f, code);
  } else {
    input.select();
    document.execCommand('copy');
  }

}

async function copyCode(f, code) {
  try {
    await navigator.clipboard.writeText(code);
    f.querySelector("nav").classList.add("copied");
    setTimeout(() => {
      f.querySelector("nav").classList.remove("copied");
    }, 1000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}
