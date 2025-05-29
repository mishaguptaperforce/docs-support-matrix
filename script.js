const dataCache = {
  interoperability: null,
  thirdPartySolutions: null,
  hardware: null,
  upgrade: null
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
  document.getElementById('tab1-intro').style.display = 'block';
  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');

  // Clear all dropdowns
  ['product1-category', 'product1-version', 'product2-category', 'product2-version'].forEach(id => {
    const el = getElement(id, activePage);
    if (el) {
      if (el.choices) {
        el.choices.clearStore();
        el.choices.setChoices(
          [{ value: '', label: '--Pick one--', selected: true, disabled: true }],
          'value',
          'label',
          true
        );
      } else {
        el.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '--Pick one--';
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        el.appendChild(defaultOpt);
      }
    }
  });
    document.getElementById('main-content').style.display = 'none';


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
            [{ value: '', label: '--Pick one--', selected: true, disabled: true }, ...allProducts.map(prod => ({ value: prod, label: prod }))],
            'value',
            'label',
            true
          );
        } else {
          el.innerHTML = '';
          const defaultOpt = document.createElement('option');
          defaultOpt.value = '';
          defaultOpt.textContent = '--Pick one--';
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
  document.getElementById('tab2-intro').style.display = 'block';
  document.getElementById('thirdPartySolutions-main-content').style.display = 'none';

  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');

  const dropdownIds = [
    'product1-category', 'product1-solution', 'product1-version',
    'product2-category', 'product2-solution', 'product2-version'
  ];

  // Reset all dropdowns with "--Pick one--" except product2-solution with "Pick one or more"
  dropdownIds.forEach(id => {
    const el = getElement(`thirdPartySolutions-${id}`, activePage);
    if (el) {
      if (el.choices) {
        el.choices.clearStore();
        el.choices.setChoices(
          [{ 
            value: '', 
            label: (id === 'product2-solution') ? '--Pick one or more--' : '--Pick one--', 
            selected: true, 
            disabled: true 
          }],
          'value',
          'label',
          true
        );
      } else {
        el.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = (id === 'product2-solution') ? '--Pick one or more--' : '--Pick one--';
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        el.appendChild(defaultOpt);
      }
    }

 });
  

  // Fetch and repopulate category dropdowns from JSON
  fetch('3rd-party-tab.json')
    .then(res => res.json())
    .then(data => {
      const p1Categories = data.x_axis.categories || [];
      const p2Categories = data.y_axis.categories || [];

      // Populate product1-category
      const el1 = getElement('thirdPartySolutions-product1-category', activePage);
      if (el1) {
        if (el1.choices) {
          el1.choices.setChoices(
            [
              { value: '', label: '--Pick one--', selected: true, disabled: true },
              ...p1Categories.map(cat => ({ value: cat, label: cat }))
            ],
            'value',
            'label',
            true
          );
        } else {
          el1.innerHTML = '';
          const defaultOpt = document.createElement('option');
          defaultOpt.value = '';
          defaultOpt.textContent = '--Pick one--';
          defaultOpt.disabled = true;
          defaultOpt.selected = true;
          el1.appendChild(defaultOpt);
          p1Categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            el1.appendChild(option);
          });
        }
      }

      // Populate product2-category
      const el2 = getElement('thirdPartySolutions-product2-category', activePage);
      if (el2) {
        if (el2.choices) {
          el2.choices.setChoices(
            [
              { value: '', label: '--Pick one--', selected: true, disabled: true },
              ...p2Categories.map(cat => ({ value: cat, label: cat }))
            ],
            'value',
            'label',
            true
          );
        } else {
          el2.innerHTML = '';
          const defaultOpt = document.createElement('option');
          defaultOpt.value = '';
          defaultOpt.textContent = '--Pick one--';
          defaultOpt.disabled = true;
          defaultOpt.selected = true;
          el2.appendChild(defaultOpt);
          p2Categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            el2.appendChild(option);
          });
        }
      }
    });

  // Enable product2-version dropdown (if needed)
  const p2v = getElement('thirdPartySolutions-product2-version', activePage);
  if (p2v) p2v.disabled = false;

  // Clear result and matrix sections
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

function resetFieldsTab3() {
  document.getElementById('tab3-intro').style.display = 'block';
  document.getElementById('hardware-main-content').style.display = 'none';

  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');

  const dropdownIds = ['hardware-category', 'hardware-product1-category'];

  // Reset all dropdowns to "--Pick one--"
  dropdownIds.forEach(id => {
    const el = getElement(id, activePage);
    if (el) {
      if (el.choices) {
        // Clear all choices and reset to placeholder
        el.choices.clearStore();
        el.choices.setChoices(
          [{ value: '', label: '--Pick one--', selected: true, disabled: true }],
          'value',
          'label',
          true
        );
      } else {
        el.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '--Pick one--';
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        el.appendChild(defaultOpt);
      }
    }
  });

  // Destroy and re-initialize Choices.js for multi-select product dropdown to avoid duplicates
  const productDropdown = document.getElementById('hardware-product1-category');
  if (productDropdown) {
    if (choicesInstances['hardware-product1-category']) {
      choicesInstances['hardware-product1-category'].destroy();
      delete choicesInstances['hardware-product1-category'];
    }
    choicesInstances['hardware-product1-category'] = new Choices(productDropdown, {
      placeholderValue: '--Pick one or more--',
      removeItemButton: true,
      searchEnabled: true,
      itemSelectText: '',
      shouldSort: false,
      closeDropdownOnSelect: true,
    });
  }

  const categoryDropdown = document.getElementById('hardware-category');
  if (categoryDropdown) {
    // Fetch hardware categories and populate category dropdown
    fetch('hardware.json')
      .then(res => res.json())
      .then(data => {
        // Populate hardware-category dropdown
        categoryDropdown.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '--Pick one--';
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        categoryDropdown.appendChild(defaultOpt);

        Object.keys(data.categories).forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
          categoryDropdown.appendChild(option);
        });

        // When category changes, update product multi-select dropdown
        categoryDropdown.addEventListener('change', () => {
          const selectedCategory = categoryDropdown.value;
          const choicesInstance = choicesInstances['hardware-product1-category'];
          if (!choicesInstance) return;

          choicesInstance.clearChoices();

          if (selectedCategory === '') {
            // If no category selected, reset product dropdown
            choicesInstance.setChoices(
              [{ value: '', label: '--Pick one or more--', selected: true, disabled: true }],
              'value',
              'label',
              true
            );
            return;
          }

          const products = data.categories[selectedCategory] || [];

          // Add an "All" option to select all products
          const allOption = { value: '__all__', label: 'All', selected: false, disabled: false };

          const productOptions = products.map(prod => ({
            value: prod,
            label: prod,
            selected: false,
            disabled: false
          }));

          choicesInstance.setChoices([allOption, ...productOptions], 'value', 'label', true);
        });
      })
      .catch(err => {
        console.error('Error fetching hardware.json:', err);
      });
  }

  // Handle "All" option selection in product dropdown
  if (productDropdown) {
    productDropdown.addEventListener('change', () => {
      const choicesInstance = choicesInstances['hardware-product1-category'];
      if (!choicesInstance) return;

      const selectedValues = choicesInstance.getValue(true);
      const categoryDropdown = document.getElementById('hardware-category');
      if (!categoryDropdown) return;

      if (selectedValues.includes('__all__')) {
        // Select all products under the current category
        fetch('hardware.json')
          .then(res => res.json())
          .then(data => {
            const products = data.categories[categoryDropdown.value] || [];
            choicesInstance.setChoiceByValue(products);
          })
          .catch(err => console.error('Error fetching hardware.json:', err));
      }
    });
  }

  // Clear results and hardware table
  getElement('hardware-result', activePage).innerHTML = '';
  getElement('hardware-table-wrapper', activePage).innerHTML = '';
}


function resetFieldsTab4() {
  document.getElementById('tab4-intro').style.display = 'block';
  document.getElementById('upgrade-main-content').style.display = 'none';
  // Reset the dropdowns to the default option '--Select--'
  ['upgrade-product1-category', 'upgrade-product1-version'].forEach(id => {
    const dropdown = document.getElementById(id);
    if (dropdown) {
      // Reset dropdown value to placeholder
      dropdown.value = '';  // Set to the default selected option (value="")
      
      // Optionally, clear any selected options or styles if needed
      dropdown.selectedIndex = 0;  // Reset to the first option (placeholder)
    }
  });

  // Clear results and tables
  document.getElementById('upgrade-result').innerHTML = '';
  document.getElementById('upgrade-table-wrapper').innerHTML = '';

  // Optionally, hide or collapse any additional content
  document.getElementById('upgrade-main-content').style.display = 'none';

  console.log('Fields and results cleared for Upgrade Tab');
}

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
  dropdown.innerHTML = ''; // ✅ Clear existing options first

  dropdown.add(new Option('--Pick one--', '', true, true));
  dropdown.options[0].disabled = true;

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
      p2v.innerHTML = '<option value="All">All</option>';
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
      p1v.innerHTML = '<option value="All">All</option>';
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
  

  // Populate category dropdowns
  data.x_axis.categories.forEach(category => {
  categorySelect.add(new Option(category, category));
});

data.y_axis.categories.forEach(category => {
  product2CategorySelect.add(new Option(category, category));
});

  // Product 1 - Category change
  categorySelect.onchange = () => {
    
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
    closeDropdownOnSelect: true
  });

  // Product 2 - Category change
  product2CategorySelect.addEventListener('change', () => {
    product2SolutionChoices.clearStore();
    product2SolutionChoices.clearChoices();
    product2SolutionChoices.enable();
    
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
    product2VersionSelect.innerHTML = '<option value="">--Pick one or more--</option>';
    
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
        
        product2VersionSelect.disabled = true;  // Disable version dropdown if no versions found
      }
    }
  });
}

function populateDropdownsTab3(data) {
  const categoryDropdown = document.getElementById('hardware-category');
  const productDropdown = document.getElementById('hardware-product1-category');

  if (!categoryDropdown || !productDropdown) {
    console.error('Dropdowns for Tab 3 not found!');
    return;
  }

  // Destroy the existing Choices instance if it already exists
  if (choicesInstances['hardware-product1-category']) {
    choicesInstances['hardware-product1-category'].destroy();
    delete choicesInstances['hardware-product1-category'];
  }

  // Initialize Choices.js for the product dropdown with multi-select enabled
  choicesInstances['hardware-product1-category'] = new Choices(productDropdown, {
    removeItemButton: true,  // Allow the user to remove selections
    searchEnabled: true,     // Enable search functionality
    itemSelectText: '',      // Remove text when selecting an item
    shouldSort: false,       // Keep the order as is
    closeDropdownOnSelect: true // Close the dropdown after a selection is made
  });

  // Clear and populate category dropdown
  
  Object.keys(data.categories).forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    categoryDropdown.appendChild(option);
  });

  // Populate product dropdown based on selected category
  categoryDropdown.addEventListener('change', () => {
    const selectedCategory = categoryDropdown.value;

    // If "All" is selected, populate the product dropdown with all products across all categories
    if (selectedCategory === 'ALL') {
      const allProducts = Object.values(data.categories).flat();
      const productOptions = allProducts.map(product => ({
        value: product,
        label: product,
        selected: false,
        disabled: false
      }));

      // Clear existing choices and update with "All" options
      choicesInstances['hardware-product1-category'].clearChoices();
      choicesInstances['hardware-product1-category'].setChoices([{ value: '__all__', label: 'All' }, ...productOptions], 'value', 'label', true);

    } else {
      // Handle the case when a valid category is selected
      const products = data.categories[selectedCategory] || [];

      // Clear existing options and update Choices.js
      choicesInstances['hardware-product1-category'].clearChoices();

      // Add "All" option for the current category
      const allOption = {
        value: '__all__',
        label: 'All',
        selected: false,
        disabled: false
      };
      choicesInstances['hardware-product1-category'].setChoices([allOption], 'value', 'label', false);

      // Add product options for the selected category
      const productOptions = products.map(product => ({
        value: product,
        label: product,
        selected: false,
        disabled: false
      }));
      choicesInstances['hardware-product1-category'].setChoices(productOptions, 'value', 'label', false);
    }
  });

  // Handle "All" option selection (when "All" is selected, select all options)
  productDropdown.addEventListener('change', () => {
    const selectedValues = choicesInstances['hardware-product1-category'].getValue(true); // Get selected values

    // If "All" is selected, select all products for the selected category
    const category = categoryDropdown.value;
    if (selectedValues.includes('__all__')) {
      const products = data.categories[category] || [];
      choicesInstances['hardware-product1-category'].setChoiceByValue(products);
    }
    choicesInstances['hardware-product1-category'].hideDropdown();
  });

  console.log('Dropdowns populated for Tab 3');
}

function populateDropdownsTab4(data) {
  const productDropdown = getElement('upgrade-product1-category', 'upgrade');
  const versionDropdown = getElement('upgrade-product1-version', 'upgrade');

  if (!productDropdown || !versionDropdown) {
    console.error('Tab 4 dropdowns not found!');
    return;
  }

  // Populate the category dropdown (product names)
  
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
  const intro = document.getElementById('tab1-intro');
if (intro) intro.style.display = 'none';
  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');
  const data = dataCache[activePage];
  if (!data) return console.error("No data loaded for", activePage);

  const get = id => getElement(id, activePage);
  const p1 = get('product1-category').value;  // Product 1 Category
  const v1 = get('product1-version').value;   // Product 1 Version
  const p2El = get('product2-category');      // Product 2 Category (multi-select)
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

    updateMatrix(data, p1, v1, p2, v2, thead, tbody, ` ${p1} and ${p2}`);
  });
  document.getElementById('main-content').style.display = 'block';
}

function checkCompatibilityTab2() {
  document.getElementById('tab2-intro').style.display = 'none';

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
      ` ${solution1} and ${solution2}`
    );
  });
  document.getElementById('thirdPartySolutions-main-content').style.display = 'block';
}

// :white_check_mark: Place this at the top of your script.js (if not already)
const choicesInstances = {};

function checkCompatibilityTab3() {
  const intro = document.getElementById('tab3-intro');
if (intro) intro.style.display = 'none';
  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');
  const data = dataCache[activePage];
  if (!data) return console.error("No data loaded for", activePage);

  const get = id => getElement(id, activePage);
  const category = get('hardware-category').value;
  const product1CategoryEl = get('hardware-product1-category');

  if (!category || !product1CategoryEl) {
    alert("Please select both a category and a product.");
    return;
  }
  
  // Get selected products from the multi-choice dropdown using Choices.js
  let selectedProducts = product1CategoryEl.choices ? product1CategoryEl.choices.getValue(true) : Array.from(product1CategoryEl.selectedOptions).map(option => option.value);
  
  // Handle case where '__all__' is selected
  if (selectedProducts.includes('__all__')) {
    selectedProducts = data.categories[category] || [];
  }

  const tableWrapper = get('hardware-table-wrapper', activePage); // Assuming you have a wrapper to append the tables
  tableWrapper.innerHTML = ''; // Clear previous content

  // Loop through selected products
  selectedProducts.forEach(product => {
    if (!data.data[product]) return; // Skip if no data for the selected product

    const categoryData = data.data[product];
    
    const section = document.createElement('div');
    section.className = 'compatibility-section';

    const table = document.createElement('table');
    table.classList.add('hardware-matrix-table');

    // Create first header row
    const thead = table.createTHead();

    // Create first header row: Toggle button and "Hardware compatibility results"
    const firstHeaderRow = thead.insertRow();
    const firstHeaderCell = firstHeaderRow.insertCell();
    firstHeaderCell.colSpan = 3;

    // Create the toggle button and move it to the left of the text
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('toggle-btn');
    toggleButton.textContent = '▶️';
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
    const categoryNameText = document.createElement('span');
    categoryNameText.textContent = ` ${product}`;

    categoryNameText.style.fontSize = '18px';
    categoryNameText.style.fontWeight = 'bold';
    categoryNameText.style.color = 'white';
    firstHeaderCell.appendChild(categoryNameText);

    // Style the header cell
    firstHeaderCell.style.textAlign = 'left'; // Left-align text and button
    firstHeaderCell.style.position = 'sticky';
    firstHeaderCell.style.zIndex = '20';
    firstHeaderCell.style.top = '0';           // stick to the top
    firstHeaderCell.style.left = '0'; 
    firstHeaderCell.style.backgroundColor = '#1d428a';
    firstHeaderCell.style.paddingLeft = '10px'; // Optional: Add padding for better alignment

    // Create second header row for table columns
    const headerRow = thead.insertRow();
    const headers = ['Instance/Shape Size', 'Support Level', 'Delphix Continuous Data version'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    // Create table body
    const tbody = table.createTBody();
    categoryData.forEach(entry => {
      const row = tbody.insertRow();
      row.insertCell().textContent = entry.instance || entry.shape || 'N/A';
      row.insertCell().textContent = entry.supportLevel || 'N/A';
      row.insertCell().textContent = entry.delphixVersion || 'N/A';
    });

    // Append the new table inside the container
    section.appendChild(table);
    tableWrapper.appendChild(section); // Append the table section to the wrapper

    // Make the table fully visible when it's first created
    tbody.style.display = 'table-row-group'; // Make table body visible
    const secondHeaderRow = table.querySelector('thead').rows[1]; // Get the second header row
    secondHeaderRow.style.display = ''; // Make second header row visible
  });
  document.getElementById('hardware-main-content').style.display = 'block';
}

function checkCompatibilityTab4() {
  const intro = document.getElementById('tab4-intro');
if (intro) intro.style.display = 'none';
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
  section.className = 'compatibility-section';

  // Create table
  const table = document.createElement('table');
  table.classList.add('upgrade-matrix-table');

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
  productNameText.textContent = ` Upgrade Path for ${selectedProduct}`;
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
  document.getElementById('upgrade-main-content').style.display = 'block';
}

function updateMatrix(data, os, osVer, db, dbVer, thead, tbody, heading) {
  const osVers = osVer 
    ? [osVer] 
    : data.y_axis.versions[os] || [];
  const dbVers = dbVer 
    ? [dbVer] 
    : data.x_axis.versions[db] || [];

  thead.innerHTML = '';
  

  // 1) Header1: toggle heading + OS name
  const header1 = document.createElement('tr');
  const th = document.createElement('th');
  th.colSpan = dbVers.length + 1;
  th.innerHTML = `
    <button class="toggle-btn">🔽</button>&nbsp; ${heading} &nbsp;&nbsp;
    <span style="font-weight: normal; font-style: italic; font-size: 0.9em;"></span>
  `;
  th.style.cssText = 'text-align:left;background:#1d428a;color:white;';
  th.style.position = 'sticky';
  th.style.top = '0';  
  th.style.left = '0';            // stick to very top
  th.style.zIndex = '30';         // higher z-index
  header1.appendChild(th);
  thead.appendChild(header1);

  // 2) Label row: legend in first cell, DB name spanning rest
  const labelRow = document.createElement('tr');

  // Legend in first cell
  const legendCell = document.createElement('th');
  legendCell.style.textAlign = 'center';
  legendCell.style.top = '40px'; 
  legendCell.style.position = 'sticky';
  legendCell.style.backgroundColor = '#f0f0f0'; 
  legendCell.style.left = '0';
  legendCell.style.zIndex = '30';
  legendCell.style.lineHeight = '1.5';
  legendCell.innerHTML = ``;
  labelRow.appendChild(legendCell);

  // DB name spanning all other columns
  const dbCell = document.createElement('th');
  dbCell.colSpan = dbVers.length;
  dbCell.textContent = db;
  dbCell.style.fontWeight = 'bold';
  dbCell.style.textAlign = 'left';
  dbCell.style.backgroundColor = '#f0f0f0';
  dbCell.style.position = 'sticky';
  dbCell.style.top = '40px';
  dbCell.style.zIndex = '30'; // Less than legend cell
  labelRow.appendChild(dbCell);

  thead.appendChild(labelRow);

  // 3) DB versions row (header2)
  const header2 = document.createElement('tr');
  header2.innerHTML = `
    <th>${os}</th>
    ${dbVers.map(v => `<th>${v}</th>`).join('')}
  `;
  // Make each th in header2 sticky with top offset
  header2.querySelectorAll('th').forEach((th, index) => {
  th.style.position = 'sticky';
  th.style.top = '80px';          // Adjust '70px' to the combined height of header1 + labelRow
  th.style.backgroundColor = '#f0f0f0'; // Or whatever bg you want
  th.style.zIndex = '30';         // Higher than tbody cells, less than header1 if needed

  // For the first <th> (os), also fix horizontally (if needed)
  if(index === 0) {
    th.style.left = '0';
           // Higher z-index because it sticks both top and left
  }
});
  thead.appendChild(header2);

  // Build each data row as before
  const rows = [];
  osVers.forEach(osv => {
    const row = document.createElement('tr');




    const cells = dbVers.map(dbv => {
      const key1 = `${os} ${osv}`.trim();
      const key2 = `${db} ${dbv}`.trim();

      let compat = data.compatibility[key1]?.[db]?.[dbv];
      if (!compat) {
        compat = data.compatibility[key2]?.[os]?.[osv];
      }
      if (!compat) {
        return `<td><i class="fa-solid fa-minus"></i><br><small></small></td>`;
      }

      const icon = compat.compatible ? 
        '<i class="fa-solid fa-circle-check" style="color: green; font-size: 20px;"></i>' : 
        '<i class="fa-solid fa-circle-xmark" style="color: #ED1C24; font-size: 20px;"></i>';
      const color = compat.compatible ? 'green' : 'red';
      return `<td><span style="color:${color}">${icon}</span><br><small>${compat.note||''}</small></td>`;
    }).join('');

    row.innerHTML = `<td>${osv}</td>${cells}`;
    tbody.appendChild(row);
    rows.push(row);
  });

  // Toggle button
  th.querySelector('.toggle-btn').onclick = () => {
    const hidden = rows[0].style.display !== 'none';
    rows.forEach(r => r.style.display = hidden ? 'none' : '');
    header2.style.display = hidden ? 'none' : '';
    labelRow.style.display = hidden ? 'none' : '';
    th.querySelector('.toggle-btn').textContent = hidden ? '▶️' : '🔽';
  };
}


function updateMatrixTab2(data, os, osVer, db, dbVer, thead, tbody, heading) {
  const dbVers = Array.isArray(dbVer) ? dbVer : [dbVer];
  const osVers = Array.isArray(osVer) ? osVer : [osVer];

  // 1) Main header row with toggle button and heading
  const header1 = document.createElement('tr');
  const th = document.createElement('th');
  th.colSpan = dbVers.length + 1;
  th.innerHTML = `<button class="toggle-btn">🔽</button>&nbsp; ${heading}`;
  th.style.cssText = 'text-align:left;background:#1d428a;color:white;position:relative;';
  header1.appendChild(th);
  thead.appendChild(header1);

  // 2) Label row: legend and DB label
  const labelRow = document.createElement('tr'); // Keep reference
  labelRow.classList.add('label-row'); // Optional class for styling/debugging

  const legendCell = document.createElement('th');
  legendCell.style.textAlign = 'center';
  legendCell.style.top = '40px';
  legendCell.style.position = 'sticky';
  legendCell.style.backgroundColor = '#f0f0f0';
  legendCell.style.left = '0';
  legendCell.style.zIndex = '25';
  legendCell.style.lineHeight = '1.5';
  legendCell.innerHTML = ``;
  labelRow.appendChild(legendCell);

  const dbCell = document.createElement('th');
  dbCell.colSpan = dbVers.length;
  dbCell.textContent = db;
  dbCell.style.fontWeight = 'bold';
  dbCell.style.textAlign = 'left';
  dbCell.style.backgroundColor = '#f0f0f0';
  dbCell.style.position = 'sticky';
  dbCell.style.top = '40px';
  dbCell.style.zIndex = '20';
  labelRow.appendChild(dbCell);

  thead.appendChild(labelRow);

  // 3) Column headers row
  const header2 = document.createElement('tr');
  header2.innerHTML = `<th>${os}</th>` + dbVers.map(v => `<th>${v}</th>`).join('');
  thead.appendChild(header2);

  // 4) Data rows
  const rows = [];
  osVers.forEach(osv => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${osv}</td>` + dbVers.map(dbv => {
      const key1 = `${os} ${osv}`.trim();
      const key2 = `${db} ${dbv}`.trim();

      let compat = data.compatibility[key1]?.[key2];
      if (!compat) compat = data.compatibility[key2]?.[key1];

      if (!compat) return `<td><i class="fa-solid fa-minus icon-na"></i></td>`;

      const icon = compat.compatible
        ? '<i class="fa-solid fa-circle-check" style="color: green; font-size: 20px;"></i>'
        : '<i class="fa-solid fa-circle-xmark" style="color: #ED1C24; font-size: 20px;"></i>';
      const color = compat.compatible ? 'green' : 'red';
      return `<td><span style="color:${color}">${icon}</span><br><small>${compat.note || ''}</small></td>`;
    }).join('');
    tbody.appendChild(row);
    rows.push(row);
  });

  // 5) Toggle logic (now includes labelRow and header2)
  th.querySelector('.toggle-btn').onclick = () => {
    const hide = rows[0].style.display !== 'none';
    rows.forEach(r => r.style.display = hide ? 'none' : '');
    labelRow.style.display = hide ? 'none' : '';
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





document.getElementById('collapseExpandAll-tab1').addEventListener('click', function () {
  const tables = document.querySelectorAll('table');

  const isCollapsing = this.textContent.trim().includes('Collapse All');

  // Toggle each table
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, index) => {
      if (index > 0) {
        row.style.display = isCollapsing ? 'none' : '';
      }
    });
  });

  // Update button HTML with icon and label
  this.innerHTML = isCollapsing
    ? '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>&nbsp;&nbsp;Expand All'
    : '<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp;Collapse All';
});


document.getElementById('collapseExpandAll-tab2').addEventListener('click', function () {
  const tables = document.querySelectorAll('table');

  // Check the current state using text content
  const isCollapsing = this.textContent.trim().includes('Collapse All');

  // Toggle visibility of rows for each table
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, index) => {
      if (index > 0) {
        row.style.display = isCollapsing ? 'none' : '';
      }
    });
  });

  // Update icon and text together
  this.innerHTML = isCollapsing
    ? '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>&nbsp;&nbsp;Expand All'
    : '<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp;Collapse All';
});




document.addEventListener('DOMContentLoaded', function () {
  const collapseBtn = document.getElementById('collapseExpandAll-tab3');

  if (collapseBtn) {
    collapseBtn.addEventListener('click', function () {
      const tables = document.querySelectorAll('table.hardware-matrix-table');
      const isCollapsing = collapseBtn.innerText.trim() === 'Collapse All';

      tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        const secondHeaderRow = table.querySelector('thead')?.rows[1];

        if (tbody) {
          tbody.style.display = isCollapsing ? 'none' : 'table-row-group';
        }
        if (secondHeaderRow) {
          secondHeaderRow.style.display = isCollapsing ? 'none' : '';
        }
      });

      // Update icon + label
      collapseBtn.innerHTML = isCollapsing
        ? '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>&nbsp;&nbsp;Expand All'
        : '<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp;Collapse All';
    });
  }
});


document.addEventListener('DOMContentLoaded', function () {
  const collapseBtn = document.getElementById('collapseExpandAll-tab4');

  if (collapseBtn) {
    collapseBtn.addEventListener('click', function () {
      const tables = document.querySelectorAll('table.upgrade-matrix-table');
      const isCollapsing = collapseBtn.innerText.trim() === 'Collapse All';

      tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        const secondHeaderRow = table.querySelector('thead')?.rows[1];

        if (tbody) {
          tbody.style.display = isCollapsing ? 'none' : 'table-row-group';
        }
        if (secondHeaderRow) {
          secondHeaderRow.style.display = isCollapsing ? 'none' : '';
        }
      });

      collapseBtn.innerHTML = isCollapsing
        ? '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>&nbsp;&nbsp;Expand All'
        : '<i class="fa-solid fa-down-left-and-up-right-to-center"></i>&nbsp;&nbsp;Collapse All';
    });
  }
});


function exportToExcelTab1() {
  const result = document.querySelector('#result');

  if (!result) {
    console.error('No result section found.');
    return;
  }

  const tables = result.querySelectorAll('.matrix-table');

  if (tables.length === 0) {
    alert("No compatibility tables found to export.");
    return;
  }

  const workbook = XLSX.utils.book_new();

  tables.forEach((table, index) => {
    // Clone the table to modify it safely
    const clone = table.cloneNode(true);

    // Replace icons with emojis + keep notes if any
    clone.querySelectorAll('td').forEach(td => {
      const icon = td.querySelector('i.fa-circle-check, i.fa-circle-xmark');
      if (icon) {
        // Emoji mapping
        const emoji = icon.classList.contains('fa-circle-check') ? '✅' : '❌';

        // Extract note text (small tag)
        const note = td.querySelector('small')?.innerText || '';

        // Replace entire cell text content with emoji + note on next line
        td.textContent = emoji + (note ? '\n' + note : '');
      }
    });

    // Convert to worksheet
    const worksheet = XLSX.utils.table_to_sheet(clone);

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `Comparison_${index + 1}`);
  });

  // Export workbook as xlsx file
  XLSX.writeFile(workbook, 'compatibility_results_tab1.xlsx');
}



function exportToExcelTab2() {
  const result = document.querySelector('#thirdPartySolutions-result');

  if (!result) {
    console.error('No result section found.');
    return;
  }

  const tables = result.querySelectorAll('.matrix-table');

  if (tables.length === 0) {
    alert("No compatibility tables found to export.");
    return;
  }

  const workbook = XLSX.utils.book_new();

  tables.forEach((table, index) => {
    const clone = table.cloneNode(true);

    clone.querySelectorAll('td').forEach(td => {
      const iconCheck = td.querySelector('i.fa-circle-check');
      const iconCross = td.querySelector('i.fa-circle-xmark');
      const iconMinus = td.querySelector('i.fa-minus');

      if (iconCheck) {
        const note = td.querySelector('small')?.innerText || '';
        td.textContent = '✅' + (note ? '\n' + note : '');
      } else if (iconCross) {
        const note = td.querySelector('small')?.innerText || '';
        td.textContent = '❌' + (note ? '\n' + note : '');
      } else if (iconMinus) {
        td.textContent = '➖';
      }
    });

    const worksheet = XLSX.utils.table_to_sheet(clone);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Comparison_${index + 1}`);
  });

  XLSX.writeFile(workbook, 'compatibility_results_tab2.xlsx');
}


function exportToExcelTab3() {
  const wrapper = document.querySelector('#hardware-table-wrapper');

  if (!wrapper) {
    console.error('No hardware-table-wrapper section found.');
    return;
  }

  const tables = wrapper.querySelectorAll('table.hardware-matrix-table');

  if (tables.length === 0) {
    console.warn('No hardware tables available to export.');
    alert("No hardware tables available to export.");
    return;
  }

  const workbook = XLSX.utils.book_new();

  tables.forEach((table, index) => {
    // Clone the table to avoid modifying the DOM
    const clonedTable = table.cloneNode(true);

    // Remove the first <tr> in <thead> (toggle row)
    const thead = clonedTable.querySelector('thead');
    if (thead && thead.rows.length > 1) {
      thead.deleteRow(0); // Remove the product name / toggle row
    }

    try {
      const worksheet = XLSX.utils.table_to_sheet(clonedTable);
      const sheetName = `Hardware_Comparison_${index + 1}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    } catch (e) {
      console.error(`Error converting table ${index + 1}:`, e);
    }
  });

  XLSX.writeFile(workbook, "hardware_compatibility_results.xlsx");
}

function exportToExcelTab4() {
  const wrapper = document.getElementById('upgrade-table-wrapper');

  if (!wrapper) {
    console.error('No upgrade-table-wrapper section found.');
    return;
  }

  const tables = wrapper.querySelectorAll('table.upgrade-matrix-table');

  if (tables.length === 0) {
    console.warn('No upgrade tables available to export.');
    alert("No upgrade tables available to export.");
    return;
  }

  const workbook = XLSX.utils.book_new();

  tables.forEach((table, index) => {
    // Clone the table to keep DOM clean
    const clonedTable = table.cloneNode(true);

    // Remove the first <tr> from <thead> (the row with toggle + product name)
    const thead = clonedTable.querySelector('thead');
    if (thead && thead.rows.length > 1) {
      thead.deleteRow(0);
    }

    try {
      const worksheet = XLSX.utils.table_to_sheet(clonedTable);
      const sheetName = `Upgrade_Path_${index + 1}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    } catch (e) {
      console.error(`Error exporting upgrade table ${index + 1}:`, e);
    }
  });

  XLSX.writeFile(workbook, "upgrade_matrix_results.xlsx");
}

// Bind the export to CSV button
document.getElementById('export-csv-tab1').onclick = exportToExcelTab1;
document.getElementById('export-csv-tab2').onclick = exportToExcelTab2;
document.getElementById('export-csv-tab3').onclick = exportToExcelTab3;
document.getElementById('export-csv-tab4').onclick = exportToExcelTab4;