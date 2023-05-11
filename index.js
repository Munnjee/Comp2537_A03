const PAGE_SIZE = 10
let currentPage = 1;
const btnPerPage = 5;
let pokemons = []

// Pagination Function
const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  // Ensures page buttons are always between 1 and numPages and current page is in the center
  const startPage = Math.max(1, currentPage - Math.floor(btnPerPage / 2));
  const endPage = Math.min(numPages, currentPage + Math.floor(btnPerPage / 2));

  // Previous Button
  if (currentPage > 1) {
    $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">&laquo;</button>
    `);
  };

  // Shows current page button as active
  for (let i = startPage; i <= endPage; i++) {
    $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${i === currentPage ? 'active' : ''}" value="${i}">${i}</button>
    `);
  };

  // Next Button
  if (endPage < numPages) {
    $("#pagination").append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">&raquo;</button>
  `);
  }
};
// End of Pagination Function

// Display 10 Pokemon per page Function
const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.charAt(0).toUpperCase() + res.data.name.substring(1)}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  });

  // Header to display number of pokemon per page being displayed with total number
  $('#numDisplay').html(
    `<h5>Viewing ${selected_pokemons.length} of ${pokemons.length} Pokemon </h5>`
  );
};

const setup = async () => {
  //Create Filter
  $("#filter").empty();
  let resType = await axios.get("https://pokeapi.co/api/v2/type");
  let types = resType.data.results;
  const filterTypes = types.map((pokemonType) => pokemonType.name);
  filterTypes.forEach((type) => {
    $("#filter").append(
      `<input type="checkbox" id="${type}" class="typeCheckbox" name="type" value="${type}"/>  
    <label for="${type}">${type}</label>  `);
  });

  //Function to retrieve pokemon types
  const getTypes = async (pokemonName) => {
    const res = await axios.get(`
    https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    return res.data.types.map((type) => type.type.name);
  };

  // Event listener to Filter
  $('body').on('change', '.typeCheckbox', async function (e) {
    // Get all checked type checkboxes
    const $selectedTypes = $("input[name='type']:checked");
    // Extract their values into an array
    const selectedTypes = $selectedTypes.map(function () {
      return this.value;
    }).get();

    // If there are any selected types
    if (selectedTypes.length > 0) {
      // Filter the pokemon array using async/await and Array.every()
      let filteredTypes = await Promise.all(
        pokemons.map(async (pokemon) => {
          const pokemonTypes = await getTypes(pokemon.name);
          return selectedTypes.every((type) =>
            pokemonTypes.includes(type))
            ? pokemon : null;
        })
      );
      // Remove any null values from the filteredTypes array
      pokemons = filteredTypes.filter((p) => p !== null);
    } else {
      // If no types are selected, reset the pokemon array to its original state
      pokemons = response.data.results;
    }
    // Paginate the filtered pokemon array using the "paginate" function
    paginate(currentPage, PAGE_SIZE, pokemons);
    // Calculate the total number of pages based on the filtered pokemon array length and page size
    let numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    // Update the pagination UI using the "updatePaginationDiv" function
    updatePaginationDiv(currentPage, numPages);
  });

  // Retrieve and store Pokemon in array using axios
  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemons)
  let numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div id="pokeImage">
          <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
          <div>
            <h3>Abilities</h3>
            <ul>
              ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
            </ul>
          </div>

          <div>
            <h3>Stats</h3>
            <ul>
              ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
          </div>

          <div>
            <h3>Types</h3>
            <ul>
              ${types.map((type) => `<li>${type}</li>`).join('')}
            </ul>
          </div>
        `)
    $('.modal-title').html(`
        <h5>#${res.data.id}</h5>
        <h2>${res.data.name.charAt(0).toUpperCase() + res.data.name.substring(1)}</h2>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages)
  })
}
$(document).ready(setup)