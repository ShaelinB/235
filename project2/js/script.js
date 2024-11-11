window.onload = (e) => {
    let pokemonName = document.getElementById('searchterm');
    let generation = document.getElementById('generation');

    if(localStorage.getItem('searchterm'))
    {
        pokemonName.value = localStorage.getItem('searchterm');
    }

    if(localStorage.getItem('generation'))
    {
        generation.value = localStorage.getItem('generation');
    }

    document.getElementById('searchButton').onclick = onClick;
};

async function onClick()
{
    console.log("Button Clicked")
    let pokemonName = document.getElementById('searchterm').value.trim().toLowerCase();
    let generation = document.getElementById('generation');
    let infoType = document.getElementById('information').value;
    let status = document.getElementById('status');
    let output = document.getElementById('output');

    localStorage.setItem('searchterm', pokemonName);
    localStorage.setItem('generation', generation.value);

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

    if(infoType=="stats")
    {
        let statsURL = "https://pokeapi.co/api/v2/pokemon/" + pokemonName + "/";
        let statsObj = await getStats(statsURL);
        let baseStats = statsObj.stats;
        let typeArr = statsObj.types;
        output.innerHTML = "<h2>Stats:</h2>"
        output.innerHTML += "<b>Types:</b> ";
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
        for (let i = 0; i < baseStats.length; i++)
        {
            output.innerHTML+= "<b>"+ baseStats[i].stat.name + ":</b> " + baseStats[i].base_stat + "<br>";
        }
        
    }
    else
    {
        let evolutionURL = await getToEvolutionData(pokemonURL)
        let evolutionObj = await getEvolutionData(evolutionURL);
        let evolvesTo = evolutionObj.chain;
        if (evolvesTo.evolves_to.length > 0)
        {
            output.innerHTML = "<h2>Evolution Tree: </h2>";
            displayEvolution(evolvesTo,output);
        }
        else
        {
            output.innerHTML = "<h2>There are no evolution for this pokemon.<h2>";
        }
        
        
    }

}

async function getGenerationData(generationURL, pokemonName)
{
    try 
    {
        let response = await fetch(generationURL);
        let obj = await response.json();
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

function displayEvolution(evolvesTo, output, level = 0)
{
    let element = document.createElement('p');
        element.innerHTML = '&nbsp;'.repeat(level*4) + "- " + evolvesTo.species.name;
        output.appendChild(element);

    if(evolvesTo.evolves_to.length > 0)
    {
        for (let i = 0; i < evolvesTo.evolves_to.length; i++)
        {
            displayEvolution(evolvesTo.evolves_to[i],output,level+1);
        }
    }
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