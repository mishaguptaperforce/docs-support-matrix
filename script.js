const dataCache = {
  interoperability: null,
  thirdPartySolutions: null
};

async function preloadDataTab1() {
  try {
    const url = `data.json?t=${Date.now()}`;
    const res = await fetch(url);
    dataCache.interoperability = await res.json();
    console.log('Preloaded data for Tab 1:', dataCache.interoperability);
    populateDropdownsTab1(dataCache.interoperability);
  } catch (error) {
    console.error('Error preloading data for Tab 1:', error);
  }
}


async function preloadDataTab2() {
  try {
    // Append cache-busting query
    const url = `3rd-party-tab.json?t=${Date.now()}`;
    const res = await fetch(url);
    dataCache.thirdPartySolutions = await res.json();
    console.log('Tab2 raw JSON:', dataCache.thirdPartySolutions);
    console.log('Tab2 compatibility keys:', Object.keys(dataCache.thirdPartySolutions.compatibility));
    populateDropdownsTab2(dataCache.thirdPartySolutions);
  } catch (error) {
    console.error('Error preloading data for Tab 2:', error);
  }
}

async function preloadDataTab3() {
  try {
    const url = `hardware.json?t=${Date.now()}`;
    const res = await fetch(url);
    const hardwareData = await res.json();
    dataCache.hardware = hardwareData;
    console.log('Preloaded data for Tab 3:', dataCache.hardware);
    populateDropdownsTab3(hardwareData);
  } catch (error) {
    console.error('Error preloading data for Tab 3:', error);
  }
}

async function preloadDataTab4() {
  try {
    const url = `upgrade.json?t=${Date.now()}`;
    const res = await fetch(url);
    const upgradeData = await res.json();
    dataCache.upgrade = upgradeData;
    console.log('Preloaded data for Tab 4:', dataCache.upgrade);
    populateDropdownsTab4(upgradeData);
  } catch (error) {
    console.error('Error preloading data for Tab 4:', error);
  }
}





function showPage(page) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.toggle('active', p.id === page + '-page'));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + page));
}

function getElement(id, page) {
  return document.getElementById(page === 'interoperability' || page === 'thirdPartySolutions' || page == 'hardware' || page == 'upgrade' ? id : `${page}-${id}`);
}


function resetFieldsTab1() {
  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');

  // Clear all dropdowns
  ['product1-category', 'product1-version', 'product2-category', 'product2-version'].forEach(id => {
    const el = getElement(id, activePage);
    if (el) {
      if (el.choices) {
        el.choices.clearStore();
      } else {
        el.innerHTML = '';
      }
    }
  });

  // Fetch and repopulate categories from JSON
  fetch('data.json')
    .then(res => res.json())
    .then(data => {
      const xProducts = data.x_axis.products || [];
      const yProducts = data.y_axis.values || [];
      const allProducts = [...new Set([...xProducts, ...yProducts])];

      ['product1-category', 'product2-category'].forEach(id => {
        const el = getElement(id, activePage);
        if (el.choices) {
          el.choices.setChoices(
            [{ value: '', label: '--Select--', selected: true, disabled: true }, ...allProducts.map(prod => ({ value: prod, label: prod }))],
            'value',
            'label',
            true
          );
        } else {
          el.innerHTML = '';
          const defaultOpt = document.createElement('option');
          defaultOpt.value = '';
          defaultOpt.textContent = '--Select--';
          defaultOpt.disabled = true;
          defaultOpt.selected = true;
          el.appendChild(defaultOpt);
          allProducts.forEach(prod => {
            const option = document.createElement('option');
            option.value = prod;
            option.textContent = prod;
            el.appendChild(option);
          });
        }
      });
    });

  const p2v = getElement('product2-version', activePage);
  if (p2v) p2v.disabled = false;

  getElement('result', activePage).innerHTML = '';
  getElement('compatibility-matrix', activePage).innerHTML = '';
}



function resetFieldsTab2() {
  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');

  const idsToReset = [
    'product1-category', 'product1-solution', 'product1-version',
    'product2-category', 'product2-solution', 'product2-version'
  ];

  // Clear all dropdowns
  idsToReset.forEach(id => {
    const el = getElement(`thirdPartySolutions-${id}`, activePage);
    if (el) {
      if (el.choices) {
        el.choices.clearStore(); // For Choices.js
      } else {
        el.innerHTML = '';
      }
    }
  });

  // Load and populate only product1-category from x_axis, and product2-category from y_axis
  fetch('3rd-party-tab.json')
    .then(res => res.json())
    .then(data => {
      // 1. Populate product1-category (x_axis.categories)
      const p1CatEl = getElement('thirdPartySolutions-product1-category', activePage);
      if (p1CatEl) {
        const categories = data.x_axis.categories;
        populateDropdown(p1CatEl, categories);
      }

      // 2. Populate product2-category (y_axis.categories)
      const p2CatEl = getElement('thirdPartySolutions-product2-category', activePage);
      if (p2CatEl) {
        const categories = data.y_axis.categories;
        populateDropdown(p2CatEl, categories);
      }
    });

  // Clear result and matrix
  getElement('result', activePage).innerHTML = '';
  getElement('compatibility-matrix', activePage).innerHTML = '';
}



// Helper to populate dropdowns with "--Select--" and options
/*
function populateDropdown(el, options) {
  if (el.choices) {
    el.choices.setChoices(
      [{ value: '', label: '--Select--', selected: true, disabled: true }]
        .concat(options.map(opt => ({ value: opt, label: opt }))),
      'value',
      'label',
      true
    );
  } else {
    el.innerHTML = '';
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '--Select--';
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    el.appendChild(defaultOpt);
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      el.appendChild(option);
    });
  }
}
*/

function populateDropdownsTab1(data) {
  const p1c = getElement('product1-category', 'interoperability');
  const p1v = getElement('product1-version', 'interoperability');
  const p2c = getElement('product2-category', 'interoperability');
  const p2v = getElement('product2-version', 'interoperability');

  if (!p1c || !p2c || !p1v || !p2v) {
    console.error('One or more elements were not found.');
    return;
  }

  const allCategories = [...data.y_axis.values];

  function populateCategoryOptions(dropdown, excludeValue = '') {
    dropdown.innerHTML = '<option value="">--Select--</option>';
    allCategories.forEach(val => {
      if (val !== excludeValue) {
        dropdown.add(new Option(val, val));
      }
    });
  }

  // Initial population
  populateCategoryOptions(p1c);
  populateCategoryOptions(p2c);

  // Product 1 category onchange
  p1c.onchange = () => {
    // Versions
    p1v.innerHTML = '<option value="">All</option>';
    (data.y_axis.versions[p1c.value] || []).forEach(v => p1v.add(new Option(v, v)));

    // Re-filter Product 2 category to exclude current Product 1 selection
    const currentP2 = p2c.value;
    populateCategoryOptions(p2c, p1c.value);

    // Restore Product 2 selection only if still valid
    if (currentP2 && currentP2 !== p1c.value) {
      p2c.value = currentP2;
    } else {
      p2c.value = '';
      p2v.innerHTML = '<option value="">All</option>';
    }
  };

  // Product 2 category onchange
  p2c.onchange = () => {
    // Versions
    p2v.innerHTML = '<option value="">All</option>';
    (data.x_axis.versions[p2c.value] || []).forEach(v => p2v.add(new Option(v, v)));

    // Re-filter Product 1 category to exclude current Product 2 selection
    const currentP1 = p1c.value;
    populateCategoryOptions(p1c, p2c.value);

    // Restore Product 1 selection only if still valid
    if (currentP1 && currentP1 !== p2c.value) {
      p1c.value = currentP1;
    } else {
      p1c.value = '';
      p1v.innerHTML = '<option value="">All</option>';
    }
  };
}


// Tab 2: Dropdown Population
function populateDropdownsTab2(data) {
  // Product 1 dropdowns
  const categorySelect = getElement('thirdPartySolutions-product1-category', 'thirdPartySolutions');
  const solutionSelect = getElement('thirdPartySolutions-product1-solution', 'thirdPartySolutions');
  const versionSelect = getElement('thirdPartySolutions-product1-version', 'thirdPartySolutions');

  // Product 2 dropdowns
  const product2CategorySelect = getElement('thirdPartySolutions-product2-category', 'thirdPartySolutions');
  const product2SolutionSelect = getElement('thirdPartySolutions-product2-solution', 'thirdPartySolutions');
  const product2VersionSelect = getElement('thirdPartySolutions-product2-version', 'thirdPartySolutions');

  if (!categorySelect || !solutionSelect || !versionSelect || !product2CategorySelect || !product2SolutionSelect || !product2VersionSelect) {
    console.error('One or more dropdown elements not found.');
    return;
  }

  // Clear all dropdowns
  categorySelect.innerHTML = '<option value="">--Select--</option>';
  solutionSelect.innerHTML = '<option value="">--Select--</option>';
  versionSelect.innerHTML = '<option value="">--Select--</option>';
  product2CategorySelect.innerHTML = '<option value="">--Select--</option>';
  product2SolutionSelect.innerHTML = '<option value="">--Select--</option>';
  product2VersionSelect.innerHTML = '<option value="">--Select--</option>';

  // Populate category dropdowns
  data.x_axis.categories.forEach(category => {
  categorySelect.add(new Option(category, category));
});

data.y_axis.categories.forEach(category => {
  product2CategorySelect.add(new Option(category, category));
});

  // Product 1 - Category change
  categorySelect.onchange = () => {
    solutionSelect.innerHTML = '<option value="">--Select Solution--</option>';
    versionSelect.innerHTML = '<option value="">--Select Version--</option>';
    versionSelect.disabled = true;

    const solutions = data.x_axis.solutions[categorySelect.value] || [];
  
  // Log to check the structure of 'solutions'
  console.log("Solutions for category:", categorySelect.value, solutions);

  // Ensure solutions are being processed as expected
  solutions.forEach(solution => {
    // Check if solution is a string and create the option
    if (typeof solution === 'string') {
      solutionSelect.add(new Option(solution, solution));
    } else {
      // If solution is an object, log it for debugging
      console.warn("Unexpected solution format:", solution);
    }
  });

  solutionSelect.disabled = false;
};



  // Product 1 - Solution change
  solutionSelect.onchange = () => {
    versionSelect.innerHTML = '<option value="">--Select Version--</option>';
    versionSelect.innerHTML = '<option value="">All</option>';
    const versions = data.x_axis.versions[solutionSelect.value] || [];
    versions.forEach(version => {
      versionSelect.add(new Option(version, version));
    });
    versionSelect.disabled = versions.length === 0;
  };

  // Product 2 - Apply Choices.js to solution dropdown (multi-select)
  const product2SolutionChoices = new Choices(product2SolutionSelect, {
    removeItemButton: true,
    maxItemCount: -1,
    searchEnabled: true,
    shouldSort: false,
    closeDropdownOnSelect: 'auto'
  });

  // Product 2 - Category change
  product2CategorySelect.addEventListener('change', () => {
    product2SolutionChoices.clearStore();
    product2SolutionChoices.clearChoices();
    product2SolutionChoices.enable();
    product2VersionSelect.innerHTML = '<option value="">--Select Version--</option>';
    product2VersionSelect.disabled = true;

    const selectedCategories = Array.from(product2CategorySelect.selectedOptions).map(option => option.value);
    const solutionSet = new Set();

    selectedCategories.forEach(category => {
      const categorySolutions = data.y_axis.solutions[category] || [];
      categorySolutions.forEach(solution => {
        solutionSet.add(solution);
      });
    });

    
    const solutionChoices = [
  { value: '__all__', label: 'All' },  // Add "All" as a special option
  ...Array.from(solutionSet).map(solution => ({ value: solution, label: solution }))
];

    product2SolutionChoices.setChoices(solutionChoices, 'value', 'label', true);
  });

  // Product 2 - Solution change
  product2SolutionSelect.addEventListener('change', () => {
    product2VersionSelect.innerHTML = '<option value="">--Select Version--</option>';
    
    // Get the selected solutions
    let selectedSolutions = Array.from(product2SolutionSelect.selectedOptions).map(opt => opt.value);

if (selectedSolutions.includes('__all__')) {
  // Replace with all possible solutions for currently selected category
  const selectedCategory = product2CategorySelect.value;
  selectedSolutions = data.y_axis.solutions[selectedCategory] || [];
  product2SolutionChoices.disable();
    product2SolutionChoices.hideDropdown();
}

    const allVersions = new Set();

    console.log('Selected solutions:', selectedSolutions); // Log the selected solutions
    
    if (selectedSolutions.length === 1) {
      // When only one solution is selected, add "All" option
      console.log('One solution selected. Adding "All" version option.');
      
      const versions = data.y_axis.versions[selectedSolutions[0]] || [];
      product2VersionSelect.innerHTML = '<option value="">All</option>';  // Add "All" option
      versions.forEach(version => allVersions.add(version));

      if (allVersions.size > 0) {
        product2VersionSelect.disabled = false;  // Enable version dropdown
        [...allVersions].forEach(version => {
          product2VersionSelect.add(new Option(version, version));  // Add all available versions as options
        });
      } else {
        product2VersionSelect.disabled = true;  // Disable version dropdown if no versions found
      }
    } else {
      // When multiple solutions are selected, list all versions
      console.log('Multiple solutions selected. Adding all versions.');
      
      const allSolutionVersions = new Set();
      selectedSolutions.forEach(solution => {
        const versions = data.y_axis.versions[solution] || [];
        versions.forEach(version => allSolutionVersions.add(version));
      });

      if (allSolutionVersions.size > 0) {
        product2VersionSelect.disabled = false;  // Enable version dropdown
        product2VersionSelect.innerHTML = '<option value="">All</option>';  // Show "All Versions" as the default option
        [...allSolutionVersions].forEach(version => {
          product2VersionSelect.add(new Option(version, version));  // Add all available versions as options
        });
      } else {
        product2VersionSelect.innerHTML = '<option value="">--Select Version--</option>';
        product2VersionSelect.disabled = true;  // Disable version dropdown if no versions found
      }
    }
  });
}



function populateDropdownsTab3(data) {
  const categoryDropdown = getElement('hardware-product1-category', 'hardware');
  console.log('Dropdown element:', categoryDropdown);

  if (!categoryDropdown) {
    console.error('Dropdown for Tab 3 not found!');
    return;
  }

  categoryDropdown.innerHTML = '<option value="">--Select--</option>';
  data.products.forEach(product => {
    const option = document.createElement('option');
    option.value = product;
    option.textContent = product;
    categoryDropdown.appendChild(option);
  });

  console.log('Dropdown populated for Tab 3');
}


function populateDropdownsTab4(data) {
  const productDropdown = getElement('upgrade-product1-category', 'upgrade');
  const versionDropdown = getElement('upgrade-product1-version', 'upgrade');

  if (!productDropdown || !versionDropdown) {
    console.error('Tab 4 dropdowns not found!');
    return;
  }

  // Populate the category dropdown (product names)
  productDropdown.innerHTML = '<option value="">--Select Category--</option>';
  Object.keys(data.products).forEach(product => {
    const option = document.createElement('option');
    option.value = product;
    option.textContent = product;
    productDropdown.appendChild(option);
  });

  // When the category is selected, populate the version dropdown
  productDropdown.addEventListener('change', () => {
    const selectedProduct = productDropdown.value;
    const versions = data.products[selectedProduct] || [];

    // Clear and repopulate the version dropdown based on the selected category
    versionDropdown.innerHTML = '<option value="">--Select Version--</option>';
    
    // Add "All Versions" option first
    const allOption = document.createElement('option');
    allOption.value = 'ALL';
    allOption.textContent = 'All';
    versionDropdown.appendChild(allOption);

    if (versions.length > 0) {
      // Populate the version dropdown based on the available versions
      versions.forEach(version => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;
        versionDropdown.appendChild(option);
      });

      versionDropdown.disabled = false;
    } else {
      // If no versions exist, disable the version dropdown
      versionDropdown.disabled = true;
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No versions available';
      versionDropdown.appendChild(option);
    }
  });

  console.log('Dropdowns populated for Tab 4');
}





function checkCompatibilityTab1() {
  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');
  const data = dataCache[activePage];
  if (!data) return console.error("No data loaded for", activePage);

  const get = id => getElement(id, activePage);
  const p1 = get('product1-category').value;  // Product 1 Category (e.g., "Continuous Data")
  const v1 = get('product1-version').value;   // Product 1 Version
  const p2El = get('product2-category');      // Product 2 Category (e.g., "Continuous Compliance")
  const v2 = get('product2-version').value;   // Product 2 Version
  const result = get('result');

  const selectedDBs = p2El.choices ? p2El.choices.getValue(true) : [p2El.value];  // Handle multi-select
  result.innerHTML = '';
  get('compatibility-matrix', activePage).innerHTML = '';

  selectedDBs.forEach(p2 => {
    const section = document.createElement('div');
    section.className = 'compatibility-section';
    section.innerHTML = `
      <div class="table-wrapper">
        <table class="matrix-table">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>`;
    result.appendChild(section);

    const thead = section.querySelector('thead');
    const tbody = section.querySelector('tbody');

    // Update the `updateMatrix` function to pass the correct data structure
    updateMatrix(data, p1, v1, p2, v2, thead, tbody, ` ${p1} vs ${p2}`);
  });
}




function checkCompatibilityTab2() {
  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');
  const data = dataCache[activePage];
  if (!data) return console.error("No data loaded for", activePage);

  const get = id => getElement(id, activePage);

  // Get Product 1 selections
  const solution1 = get('thirdPartySolutions-product1-solution').value;
  const version1 = get('thirdPartySolutions-product1-version').value;

  // Get Product 2 selections
  const solution2El = get('thirdPartySolutions-product2-solution');
  const version2 = get('thirdPartySolutions-product2-version').value;
  const result = get('thirdPartySolutions-result');

  // Get the selected solutions for Product 2
  let selectedSolutions2 = solution2El.choices
  ? solution2El.choices.getValue(true)
  : Array.from(solution2El.selectedOptions).map(option => option.value);

// Handle "All" selection logic
if (selectedSolutions2.includes('__all__')) {
  const selectedCategory2 = get('thirdPartySolutions-product2-category').value;
  selectedSolutions2 = data.y_axis.solutions[selectedCategory2] || [];
}

  console.log('selectedSolutions2:', selectedSolutions2);

  result.innerHTML = '';
  get('compatibility-matrix', activePage).innerHTML = '';

  selectedSolutions2.forEach(solution2 => {
    // Retrieve the versions for the current solution2
    const versions2 = version2
      ? [version2]  // If a version is selected, use it
      : data.y_axis.versions[solution2] || [];  // Otherwise, use all available versions for the solution2

      const versions1 = version1
      ? [version1]  // If a version is selected, use it
      : data.x_axis.versions[solution1] || [];

    console.log(`versions2 for ${solution2}:`, versions2);  // Log versions for debugging
    console.log(`versions1 for ${solution1}:`, versions1); 

    const section = document.createElement('div');
    section.className = 'compatibility-section';
    section.innerHTML = `
      <div class="table-wrapper">
        <table class="matrix-table">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>`;
    result.appendChild(section);

    const thead = section.querySelector('thead');
    const tbody = section.querySelector('tbody');

    // Pass the correct versions2 to updateMatrixTab2
    updateMatrixTab2(
      data,
      solution1,
      versions1,
      solution2,
      versions2,  // Now passing the correct versions for each solution2
      thead,
      tbody,
      ` ${solution1} vs ${solution2}`
    );
  });
}


function checkCompatibilityTab4() {
  const productDropdown = document.getElementById('upgrade-product1-category');
  const versionDropdown = document.getElementById('upgrade-product1-version');
  const tableWrapper = document.getElementById('upgrade-table-wrapper');

  const selectedProduct = productDropdown.value;
  const selectedVersion = versionDropdown.value;

  if (!selectedProduct || !selectedVersion) {
    alert("Please select both a product and a version.");
    return;
  }

  const productVersions = dataCache.upgrade.upgradePaths[selectedProduct];

  if (!productVersions) {
    alert("Invalid product selected.");
    return;
  }

  // Create table container similar to Tab 1 structure
  const section = document.createElement('div');
  section.className = 'table-wrapper';

  // Create table
  const table = document.createElement('table');
  table.classList.add('upgrade-table');

  // Create first header row with product name
  const thead = table.createTHead();

  // Create first header row: "Upgrade Path Table for <product-name>"
  const firstHeaderRow = thead.insertRow();
  const firstHeaderCell = firstHeaderRow.insertCell();
  firstHeaderCell.colSpan = 4; // Assuming you have 4 columns in your table

  // Create the toggle button and move it to the left of the text
  const toggleButton = document.createElement('button');
  toggleButton.classList.add('toggle-btn');
  toggleButton.textContent = '🔽'; // Default to collapsed state
  toggleButton.addEventListener('click', () => {
    const tbody = table.querySelector('tbody'); // Get the tbody element
    const secondHeaderRow = table.querySelector('thead').rows[1]; // Get the second header row

    if (tbody.style.display === 'none') {
      tbody.style.display = 'table-row-group'; // Show the table body
      secondHeaderRow.style.display = ''; // Show the second header row
      toggleButton.textContent = '🔽'; // Expand icon
    } else {
      tbody.style.display = 'none'; // Hide the table body
      secondHeaderRow.style.display = 'none'; // Hide the second header row
      toggleButton.textContent = '▶️'; // Collapse icon
    }
  });

  // Insert the toggle button before the product name text
  firstHeaderCell.appendChild(toggleButton);
  
  // Set the product name text
  const productNameText = document.createElement('span');
  productNameText.textContent = `Upgrade Path Table for ${selectedProduct}`;
  productNameText.style.fontSize = '18px';
  productNameText.style.fontWeight = 'bold';
  productNameText.style.color = 'white';
  firstHeaderCell.appendChild(productNameText);
  
  // Style the header cell
  firstHeaderCell.style.textAlign = 'left'; // Left-align text and button
  firstHeaderCell.style.backgroundColor = '#1d428a';
  firstHeaderCell.style.paddingLeft = '10px'; // Optional: Add padding for better alignment

  // Create second header row for table columns
  const headerRow = thead.insertRow();
  const headers = ['Version', 'Date Released', 'Can Upgrade To', 'VDB Downtime Required'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  // Create table body
  const tbody = table.createTBody();

  if (selectedVersion === 'ALL') {
    // If "All Versions" is selected, create rows for each version of the selected product
    Object.keys(productVersions).forEach(version => {
      const versionData = productVersions[version];
      const row = tbody.insertRow();
      row.insertCell().textContent = version;
      row.insertCell().textContent = versionData.dateReleased || 'N/A';
      row.insertCell().textContent = versionData.canUpgradeTo || 'N/A';
      row.insertCell().textContent = versionData.vdbDowntimeRequired || 'N/A';
    });
  } else {
    // If a specific version is selected, show that version's data
    const versionData = productVersions[selectedVersion];
    const row = tbody.insertRow();
    row.insertCell().textContent = selectedVersion;
    row.insertCell().textContent = versionData.dateReleased || 'N/A';
    row.insertCell().textContent = versionData.canUpgradeTo || 'N/A';
    row.insertCell().textContent = versionData.vdbDowntimeRequired || 'N/A';
  }

  // Clear existing table and append the new table inside the container
  tableWrapper.innerHTML = ''; // Clear previous table
  section.appendChild(table);
  tableWrapper.appendChild(section); // Append the table section to the wrapper

  // Make the table fully visible when it's first created
  tbody.style.display = 'table-row-group'; // Make table body visible
  const secondHeaderRow = table.querySelector('thead').rows[1]; // Get the second header row
  secondHeaderRow.style.display = ''; // Make second header row visible
}








function updateMatrix(data, os, osVer, db, dbVer, thead, tbody, heading) {
  // Build the list of versions for each axis
  const osVers = osVer 
    ? [osVer] 
    : data.y_axis.versions[os] || [];
  const dbVers = dbVer 
    ? [dbVer] 
    : data.x_axis.versions[db] || [];

  // Header row with toggle button
  const header1 = document.createElement('tr');
  const th = document.createElement('th');
  th.colSpan = dbVers.length + 1;
  th.innerHTML = `<button class="toggle-btn">🔽</button> ${heading}`;
  th.style.cssText = 'text-align:left;background:#1d428a;color:white;position:relative;';
  header1.appendChild(th);
  thead.appendChild(header1);

  // Second header explaining icons + column headers
  const header2 = document.createElement('tr');
  header2.innerHTML = `
    <th>
    <div style="text-align:center; line-height: 1.5;">
      ✅ = Compatible<br>
      ❌ = Incompatible<br>
      <span style="color:#888;">&ndash;</span> = Not Applicable<br>
    </div>
</th>
    ${dbVers.map(v => `<th>${db} ${v}</th>`).join('')}
  `;
  thead.appendChild(header2);

  // Build each data row
  const rows = [];
  osVers.forEach(osv => {
    const row = document.createElement('tr');
    const cells = dbVers.map(dbv => {
      const key1 = `${os} ${osv}`.trim();  // e.g. "Continuous Data 6.0.0.0"
      const key2 = `${db} ${dbv}`.trim();  // e.g. "Continuous Compliance 6.0.1.0"

      // 1) Try OS→DB
      let compat = data.compatibility[key1]?.[db]?.[dbv];

      // 2) If no data, fallback DB→OS
      if (!compat) {
        compat = data.compatibility[key2]?.[os]?.[osv];
      }

      if (!compat) {
        return `<td><span style="color: #888; font-size: 1.2em;">&ndash;</span><br><small></small>
</td>`;
      }

      const icon = compat.compatible ? '✅' : '❌';
      const color = compat.compatible ? 'green' : 'red';
      return `<td><span style="color:${color}">${icon}</span><br><small>${compat.note||''}</small></td>`;
    }).join('');

    row.innerHTML = `<td>${os} ${osv}</td>${cells}`;
    tbody.appendChild(row);
    rows.push(row);
  });

  // Wire up collapse/expand
  th.querySelector('.toggle-btn').onclick = () => {
    const hidden = rows[0].style.display !== 'none';
    rows.forEach(r => r.style.display = hidden ? 'none' : '');
    header2.style.display = hidden ? 'none' : '';
    th.querySelector('.toggle-btn').textContent = hidden ? '▶️' : '🔽';
  };
}





function updateMatrixTab2(data, os, osVer, db, dbVer, thead, tbody, heading) {
  // Ensure dbVers is always an array
  const dbVers = Array.isArray(dbVer) ? dbVer : [dbVer];  // If dbVer is not an array, wrap it in an array
  const osVers = Array.isArray(osVer) ? osVer : [osVer];  // Same for osVer
  
  // Your previous table rendering logic
  const header1 = document.createElement('tr');
  const th = document.createElement('th');
  th.colSpan = dbVers.length + 1;
  th.innerHTML = `<button class="toggle-btn" >🔽</button> ${heading}`;
  th.style.cssText = 'text-align:left;background:#1d428a;color:white;position:relative;';
  header1.appendChild(th);
  thead.appendChild(header1);

  const header2 = document.createElement('tr');
  header2.innerHTML = `<th>
    <div style="text-align:center; line-height: 1.5;">
      ✅ = Compatible<br>
      ❌ = Incompatible<br>
      <span style="color:#888;">&ndash;</span> = Not Applicable
    </div>
  </th>` + dbVers.map(v => `<th>${db} ${v}</th>`).join('');
  thead.appendChild(header2);

  const rows = [];
  osVers.forEach(osv => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${os} ${osv}</td>` + dbVers.map(dbv => {
      console.log('Checking compatibility for:', `${os} ${osv}`, 'vs', `${db} ${dbv}`);
console.log('Data entry:', data.compatibility[`${os} ${osv}`]);
console.log('Full compatibility check:', data.compatibility[`${os} ${osv}`]?.[`${db} ${dbv}`]);

      const key1 = `${os} ${osv}`.trim();   // e.g. "Oracle 21c"
const key2 = `${db} ${dbv}`.trim();   // e.g. "RHEL 9"

console.log('Trying lookup:', key1, 'vs', key2);
let compat = data.compatibility[key1]?.[key2];

if (!compat) {
  // fallback: try reverse direction
  console.log(`  ↳ no data, trying reverse: ${key2} vs ${key1}`);
  compat = data.compatibility[key2]?.[key1];
}

// final
console.log('  ↳ result:', compat);

      if (!compat) return `<td><span style="color: #888; font-size: 1.2em;">&ndash;</span></td>`;

      const icon = compat.compatible ? '✅' : '❌';
      const color = compat.compatible ? 'green' : 'red';
      return `<td><span style="color:${color}">${icon}</span><br><small>${compat.note || ''}</small></td>`;
    }).join('');
    tbody.appendChild(row);
    rows.push(row);
  });

  th.querySelector('.toggle-btn').onclick = () => {
    const hide = rows[0].style.display !== 'none';
    rows.forEach(r => r.style.display = hide ? 'none' : '');
    header2.style.display = hide ? 'none' : '';
    th.querySelector('.toggle-btn').textContent = hide ? '▶️' : '🔽';
  };
}












document.addEventListener("DOMContentLoaded", async function () {
  await preloadDataTab1();
  await preloadDataTab2();
  await preloadDataTab3();
  await preloadDataTab4();
  showPage('interoperability');

  document.querySelectorAll('.collapsible-heading').forEach(h => {
    h.onclick = () => {
      h.classList.toggle('active');
      const content = h.nextElementSibling;
      content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + 'px';
      content.style.padding = content.style.maxHeight ? '18px' : '0';
    };
  });
});

document.getElementById('collapseExpandAll-tab1').addEventListener('click', function() {
  // Get all tables on the page (you can customize the selector if needed)
  const tables = document.querySelectorAll('table');

  // Check the current state of the button (text is "Collapse All" or "Expand All")
  const isCollapsing = this.textContent === 'Collapse All';

  // Toggle each table based on the current state
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr');
    
    // If collapsing, hide all rows except the header row (assumed to be the first row)
    rows.forEach((row, index) => {
      if (index > 0) { // Exclude the header row
        row.style.display = isCollapsing ? 'none' : ''; // Hide rows if collapsing
      }
    });
  });

  // Change the button text depending on the current action
  if (isCollapsing) {
    this.textContent = 'Expand All'; // Change to "Expand All"
  } else {
    this.textContent = 'Collapse All'; // Change to "Collapse All"
  }
});

document.getElementById('collapseExpandAll-tab2').addEventListener('click', function() {
  // Get all tables on the page (you can customize the selector if needed)
  const tables = document.querySelectorAll('table');

  // Check the current state of the button (text is "Collapse All" or "Expand All")
  const isCollapsing = this.textContent === 'Collapse All';

  // Toggle each table based on the current state
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr');
    
    // If collapsing, hide all rows except the header row (assumed to be the first row)
    rows.forEach((row, index) => {
      if (index > 0) { // Exclude the header row
        row.style.display = isCollapsing ? 'none' : ''; // Hide rows if collapsing
      }
    });
  });

  // Change the button text depending on the current action
  if (isCollapsing) {
    this.textContent = 'Expand All'; // Change to "Expand All"
  } else {
    this.textContent = 'Collapse All'; // Change to "Collapse All"
  }
});



function exportToExcelTab1() {
  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');
  const result = document.querySelector('#result');

  if (!result) {
    console.error('No result section found.');
    return;
  }

  const workbook = XLSX.utils.book_new(); // Create a new workbook

  const tables = result.querySelectorAll('.matrix-table');

  tables.forEach((table, index) => {
    const worksheet = XLSX.utils.table_to_sheet(table); // Convert each table
    const sheetName = `Table_${index + 1}`; // Name sheets like Comparison_1, Comparison_2
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Export the workbook
  XLSX.writeFile(workbook, "compatibility_results_tab1.xlsx");
}


function exportToExcelTab2() {
  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');
  const result = document.querySelector(`#${activePage}-result`);

  if (!result) {
    console.error('No result section found.');
    return;
  }

  const workbook = XLSX.utils.book_new(); // Create new workbook

  const tables = result.querySelectorAll('.matrix-table');

  tables.forEach((table, index) => {
    const worksheet = XLSX.utils.table_to_sheet(table); // Convert table to sheet
    const sheetName = `Table_${index + 1}`; // Name each sheet Table_1, Table_2 etc
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Export the workbook
  XLSX.writeFile(workbook, "compatibility_results_3rd_party.xlsx");
}




// Bind the export to CSV button
document.getElementById('export-csv-tab1').onclick = exportToExcelTab1;
document.getElementById('export-csv-tab2').onclick = exportToExcelTab2;

