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
      } else {
        el.innerHTML = '';
      }
    }
    document.getElementById('main-content').style.display = 'none';
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
  document.getElementById('tab2-intro').style.display = 'block';
  // Hide the main results container before clearing dropdowns
  document.getElementById('thirdPartySolutions-main-content').style.display = 'none';

  const activePage = document.querySelector('.page-content.active').id.replace('-page', '');

  // Clear all dropdowns
  [
    'product1-category', 'product1-solution', 'product1-version',
    'product2-category', 'product2-solution', 'product2-version'
  ].forEach(id => {
    const el = getElement(`thirdPartySolutions-${id}`, activePage);
    if (el) {
      if (el.choices) {
        el.choices.clearStore();
      } else {
        el.innerHTML = '';
      }
    }
    
  });

  // Fetch and repopulate categories from 3rd-party-tab.json
  fetch('3rd-party-tab.json')
    .then(res => res.json())
    .then(data => {
      // Repopulate categories for product 1 and product 2
      const p1Categories = data.x_axis.categories || [];
      const p2Categories = data.y_axis.categories || [];

      // Repopulate dropdowns for product 1 category and product 2 category
      ['product1-category', 'product2-category'].forEach(id => {
        const el = getElement(`thirdPartySolutions-${id}`, activePage);
        if (el) {
          if (el.choices) {
            el.choices.setChoices(
              [{ value: '', label: '--Select--', selected: true, disabled: true }, ...p1Categories.map(cat => ({ value: cat, label: cat }))],
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
            p1Categories.forEach(cat => {
              const option = document.createElement('option');
              option.value = cat;
              option.textContent = cat;
              el.appendChild(option);
            });
          }
        }
      });
    });

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

  // Clear all dropdowns
  ['hardware-category', 'hardware-product1-category'].forEach(id => {
    const el = getElement(id, activePage);
    if (el) {
      if (el.choices) {
        // Clear selected choices and reset dropdown
        el.choices.clearStore();  // Clears the choices from memory
        el.choices.clearChoices();  // Clears visual selection from dropdown
        el.choices.setChoiceByValue('');  // Set placeholder (e.g., "--Select--")
        el.choices.setValue([]); // Deselect all values in multi-select dropdown

        // Reset the dropdown appearance fully (clear any residual items or visual cues)
        const dropdownContainer = el.closest('.choices'); // Target the whole dropdown container
        const inputField = dropdownContainer.querySelector('.choices__input'); // Input field element
        const selectedItems = dropdownContainer.querySelector('.choices__list--multiple'); // List of selected items

        // Remove any visual selected items
        if (selectedItems) {
          selectedItems.innerHTML = ''; // Clear the selected items list
        }
        if (inputField) {
          inputField.value = ''; // Clear the input field's value
        }
      } else {
        // If not using Choices.js, just clear the innerHTML and reset to placeholder
        el.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '';
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        el.appendChild(defaultOpt);
      }
    }
  });

  // Reinitialize the Choices.js instance after clearing it
  const categoryDropdown = document.getElementById('hardware-category');
  const productDropdown = document.getElementById('hardware-product1-category');

  if (categoryDropdown && productDropdown) {
    // Clear and reinitialize Choices.js
    if (choicesInstances['hardware-product1-category']) {
      choicesInstances['hardware-product1-category'].destroy();
      delete choicesInstances['hardware-product1-category'];
    }

    // Initialize Choices.js for the product dropdown
    choicesInstances['hardware-product1-category'] = new Choices(productDropdown, {
      removeItemButton: true,  // Allow the user to remove selections
      searchEnabled: true,     // Enable search functionality
      itemSelectText: '',      // Remove text when selecting an item
      shouldSort: false,       // Keep the order as is
      closeDropdownOnSelect: true // Close dropdown after selection
    });

    // Repopulate the category dropdown and product dropdown
    fetch('hardware.json')
      .then(res => res.json())
      .then(data => {
        // Clear and populate category dropdown
        categoryDropdown.innerHTML = '<option value="">--Select--</option>';
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
            // Handle case when a valid category is selected
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

        // Handle "All" option selection (select all products for selected category)
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

        console.log('Dropdowns repopulated for Tab 3');
      })
      .catch(error => {
        console.error('Error fetching hardware data:', error);
      });
  }

  // Clear result and table sections
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
    solutionSelect.innerHTML = '<option value="">--Select--</option>';
    versionSelect.innerHTML = '<option value="">--Select--</option>';
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
    versionSelect.innerHTML = '<option value="">--Select--</option>';
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
    product2VersionSelect.innerHTML = '<option value="">--Select--</option>';
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
    product2VersionSelect.innerHTML = '<option value="">--Select--</option>';
    
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
        product2VersionSelect.innerHTML = '<option value="">--Select--</option>';
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
  categoryDropdown.innerHTML = '<option value="">--Select--</option>';
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
  productDropdown.innerHTML = '<option value="">--Select--</option>';
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
    versionDropdown.innerHTML = '<option value="">--Select--</option>';
    
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
    const headers = ['Instance/Shape Size', 'Support Level', 'Delphix version'];
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
  th.style.top = '0';             // stick to very top
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
  legendCell.style.zIndex = '25';
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
  dbCell.style.zIndex = '20'; // Less than legend cell
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
  th.style.zIndex = index === 0 ? 20 : 15;         // Higher than tbody cells, less than header1 if needed

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
  // Ensure dbVers is always an array
  const dbVers = Array.isArray(dbVer) ? dbVer : [dbVer];  // If dbVer is not an array, wrap it in an array
  const osVers = Array.isArray(osVer) ? osVer : [osVer];  // Same for osVer
  
  // Your previous table rendering logic
  const header1 = document.createElement('tr');
  const th = document.createElement('th');
  th.colSpan = dbVers.length + 1;
  th.innerHTML = `<button class="toggle-btn" >🔽</button>&nbsp; ${heading}`;
  th.style.cssText = 'text-align:left;background:#1d428a;color:white;position:relative;';
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
  legendCell.style.zIndex = '25';
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
  dbCell.style.zIndex = '20'; // Less than legend cell
  labelRow.appendChild(dbCell);

  thead.appendChild(labelRow);

  const header2 = document.createElement('tr');
  header2.innerHTML = `<th>${os}</th>` + dbVers.map(v => `<th>${v}</th>`).join('');
  thead.appendChild(header2);

  const rows = [];
  osVers.forEach(osv => {
    const row = document.createElement('tr');
    row.innerHTML = ` <td>${osv}</td>` + dbVers.map(dbv => {
      console.log('Checking compatibility for:', `${os} ${osv}`, 'and', `${db} ${dbv}`);
console.log('Data entry:', data.compatibility[`${os} ${osv}`]);
console.log('Full compatibility check:', data.compatibility[`${os} ${osv}`]?.[`${db} ${dbv}`]);

      const key1 = `${os} ${osv}`.trim();   // e.g. "Oracle 21c"
const key2 = `${db} ${dbv}`.trim();   // e.g. "RHEL 9"

console.log('Trying lookup:', key1, 'and', key2);
let compat = data.compatibility[key1]?.[key2];

if (!compat) {
  // fallback: try reverse direction
  console.log(`  ↳ no data, trying reverse: ${key2} and ${key1}`);
  compat = data.compatibility[key2]?.[key1];
}

// final
console.log('  ↳ result:', compat);

      if (!compat) return `<td><i class="fa-solid fa-minus"></i></td>`;

      const icon = compat.compatible ? '<i class="fa-solid fa-circle-check" style="color: green; font-size: 20px;"></i>' : '<i class="fa-solid fa-circle-xmark" style="color: #ED1C24; font-size: 20px;""></i>';
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

document.addEventListener('DOMContentLoaded', function () {
  const collapseBtn = document.getElementById('collapseExpandAll-tab3');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function () {
      const tables = document.querySelectorAll('table.hardware-matrix-table');
      const isCollapsing = this.textContent === 'Collapse All';

      tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        const secondHeaderRow = table.querySelector('thead')?.rows[1];

        if (tbody && secondHeaderRow) {
          tbody.style.display = isCollapsing ? 'none' : 'table-row-group';
          secondHeaderRow.style.display = isCollapsing ? 'none' : '';
        }
      });

      this.textContent = isCollapsing ? 'Expand All' : 'Collapse All';
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const collapseBtn = document.getElementById('collapseExpandAll-tab4');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function () {
      const tables = document.querySelectorAll('table.upgrade-matrix-table');
      const isCollapsing = this.textContent === 'Collapse All';

      tables.forEach(table => {
        const tbody = table.querySelector('tbody');
        const secondHeaderRow = table.querySelector('thead')?.rows[1];

        if (tbody && secondHeaderRow) {
          tbody.style.display = isCollapsing ? 'none' : 'table-row-group';
          secondHeaderRow.style.display = isCollapsing ? 'none' : '';
        }
      });

      this.textContent = isCollapsing ? 'Expand All' : 'Collapse All';
    });
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