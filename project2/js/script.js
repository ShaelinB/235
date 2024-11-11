
//onload that gets the previous search term and generation and sets it to it
window.onload = (e) => {
    let pokemonName = document.querySelector('#searchterm');
    let generation = document.querySelector('#generation');

    //cheks if there was something in the search term
    if(localStorage.getItem('searchterm'))
    {
        pokemonName.value = localStorage.getItem('searchterm');
    }

    //checks if there was a generation other than the default selected
    if(localStorage.getItem('generation'))
    {
        generation.value = localStorage.getItem('generation');
    }

    document.getElementById('searchButton').onclick = onClick;
};

//function that gets info when clicked
async function onClick()
{
    console.log("Button Clicked")
    //gets elements from the document
    let pokemonName = document.querySelector('#searchterm').value.trim().toLowerCase();
    let generation = document.querySelector('#generation');
    let infoType = document.querySelector('#information').value;
    let status = document.querySelector('#status');
    let output = document.querySelector('#output');

    //sets the local storage to the values in the search bar and generation pull down whenever the search button is clicked
    localStorage.setItem('searchterm', pokemonName);
    localStorage.setItem('generation', generation.value);

    //creates the first url that is used to see if that pokemon exists
    let generationURL = "https://pokeapi.co/api/v2/generation/"+generation.value+"/";
    let pokemonURL =  await getGenerationData(generationURL,pokemonName);
    if (pokemonURL == null)
    {
        status.innerHTML= pokemonName+" was not found. Did you spell it right and are you in the right generation?";
        output.innerHTML = "";
        console.log("inncorrect pokemon")
        return;
    }
    status.innerHTML = "You chose " + pokemonName + "!";

    //if the user selects stats on the information drop down
    if(infoType=="stats")
    {
        //creates a new link used to get the stats of a specific pokemon
        let statsURL = "https://pokeapi.co/api/v2/pokemon/" + pokemonName + "/";
        let statsObj = await getStats(statsURL);
        let baseStats = statsObj.stats;
        let typeArr = statsObj.types;
        output.innerHTML = "<h2>Stats:</h2>"
        output.innerHTML += "<b>Types:</b> ";
        //loops through the array and displays all the types the pokemon is
        for (let i = 0; i < typeArr.length; i++)
            {
                if (i === 0)
                {
                    output.innerHTML += typeArr[i].type.name;
                }
                else
                {
                    output.innerHTML += ", "+typeArr[i].type.name;
                }
                
            }
        output.innerHTML += "<br><br>"
        //loops through the array and displays all the base stats of the pokemon
        for (let i = 0; i < baseStats.length; i++)
        {
            output.innerHTML+= "<b>"+ baseStats[i].stat.name + ":</b> " + baseStats[i].base_stat + "<br>";
        }
        
    }
    //if the user selects evolution on the information drop down
    else
    {
        //gets the link that contains the evolution chain
        let evolutionURL = await getToEvolutionData(pokemonURL)
        //gets the evolution chain object
        let evolutionObj = await getEvolutionData(evolutionURL);
        let evolvesTo = evolutionObj.chain;
        //if the length of the array is greater than 0 then there are evolutions
        if (evolvesTo.evolves_to.length > 0)
        {
            output.innerHTML = "<h2>Evolution Tree: </h2>";
            displayEvolution(evolvesTo,output,pokemonName);
        }
        else
        {
            output.innerHTML = "<h2>There are no evolution for this pokemon.<h2>";
        }
        
        
    }

}

//get a json that contains an array of species in that generation
//returns link that brings you to the json of that specific species
async function getGenerationData(generationURL, pokemonName)
{
    try 
    {
        let response = await fetch(generationURL);
        let obj = await response.json();

        //loops through the array to check if the pokemon exists
        for (let i = 0; i < obj.pokemon_species.length; i++)
        {
            if (obj.pokemon_species[i].name === pokemonName)
            {
                return obj.pokemon_species[i].url;
            }
        }
        return null;
    }
    catch (error)
    {
        console.log("getGenerationData error");
        return null;
    }
}

//gets a json that contains the base stats of the pokemon and their types
//returns the entire object
async function getStats(statsURL)
{
    try 
    {
        let response = await fetch(statsURL);
        let obj = await response.json();
        return obj;
    }
    catch (error)
    {
        console.log("getStats error");
        return null;
    }
}

//takes the first link and returns the link that contains the evolution data
async function getToEvolutionData(pokemonURL)
{
    try 
    {
        let response = await fetch(pokemonURL);
        let obj = await response.json();
        return obj.evolution_chain.url;
    }
    catch (error)
    {
        console.log("getToEvolutionData error");
        return null;
    }
}

//returns the obj that contains the evolution chain
async function getEvolutionData(evolutionURL)
{
    try 
    {
        let response = await fetch(evolutionURL);
        let obj = await response.json();
        return obj;
    }
    catch (error)
    {
        console.log("getEvolutionData error");
        return null;
    }
}

//a recursive function that goes through the whole evolution tree
//displays all levels to the tree and it can be shown through indents
function displayEvolution(evolvesTo, output, pokemonName, level = 0)
{
    //creates a object and spaces it depending on what level of the tree it's in
    let element = document.createElement('p');
    element.innerHTML = '&nbsp;'.repeat(level*4) + "- " + evolvesTo.species.name;
    if (evolvesTo.species.name === pokemonName)
    {
        element.innerHTML += " (selected Pokemon)";
    }

    output.appendChild(element);

    //if this obj contains an array with a length greater than 0 then there are more evolutions
    if(evolvesTo.evolves_to.length > 0)
    {
        //loops through all the possible evolutions in the next level and calls the function using that information
        for (let i = 0; i < evolvesTo.evolves_to.length; i++)
        {
            displayEvolution(evolvesTo.evolves_to[i],output,pokemonName,level+1);
        }
    }
    //if the level is 0 and that obj doesn't have a evolves_to arr then there are no evolutions because it's just the baby
    else if (level === 0)
    {
        output.innerHTML = "There are no evolutions for this pokemon";
    }
}

function dataError(e)
{
    console.log("An error occured");
}

//stuff for xhr----------------------------------------

// function generationLoaded(e)
// {
//     let xhr = e.target;

//     console.log(xhr.responseText);

//     let obj = JSON.parse(xhr.responeText);

//     for (let i = 0; i < obj.pokemon_species.length; i++)
//     {
//         if (obj.pokemon_species[i].name == pokemonName)
//         {
//             return obj.pokemon_species[i].url;
//         }
//     }
// }

// function statsLoaded(e)
// {
//     let xhr = e.target;
//     console.log(xhr.responseText);
//     let obj = JSON.parse(xhr.responeText);
//     return obj;
// }

// function pokemonToEvolutionLoaded(e)
// {
//     let xhr = e.target;
//     console.log(xhr.responseText);
//     let obj = JSON.parse(xhr.responeText);
//     return obj.evolution_chain.url;
// }

// function evolutionLoaded(e)
// {
//     let xhr = e.target;
//     console.log(xhr.responseText);
//     let obj = JSON.parse(xhr.responeText);
//     return obj;
// }