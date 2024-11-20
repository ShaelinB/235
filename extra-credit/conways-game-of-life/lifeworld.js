const lifeworld = {

    init(numCols,numRows){
        this.numCols = numCols,
        this.numRows = numRows,
        this.world = this.buildArray();
        this.worldBuffer = this.buildArray();
        this.randomSetup();
    },

    buildArray() {
        let outerArray = [];
        for (let row = 0; row<this.numRows; row++){
            let innerArray = [];
            for (let col = 0; col < this.numCols; col++){
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        return outerArray;
    },

    randomSetup() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++){
                this.world[row][col] = 0;
                if(Math.random() < .1) {
                    this.world[row][col] = 1;
                }
            }
        }
    },

    getLivingNeighbors(row,col){
        let neighbors = 0;
        //loops through all neighbors
        for(let r = -1; r <= 1; r++)
        {
            for(let c = -1; c <= 1; c++)
            {
                //skips current cell
                if(r===0 && c===0)
                {
                    continue;
                }
                let neighborRow = row + r;
                let neighborCol = col + c;
                //checks if the neighbor is valid
                if(neighborRow >= 0 && neighborRow < this.numRows && neighborCol >= 0 && neighborCol < this.numCols)
                {
                    //checks if its alive
                    if(this.world[neighborRow][neighborCol] === 1)
                    {
                        neighbors++;
                    }
                }
            }
        }
        return neighbors;
    },

    step(){
        //loops through all the cells
        for (let row = 0; row < this.numRows; row++) 
        {
            for (let col = 0; col < this.numCols; col++)
            {
                let currentCell = this.world[row][col];
                let neighbors = this.getLivingNeighbors(row,col);
                //if its an alive cell and has less than 2 or more than 3 neighbors
                if(currentCell === 1 && (neighbors < 2 || neighbors > 3))
                {
                    //dies
                    this.worldBuffer[row][col] = 0;
                }
                //if its dead and has exactly 3 neighbors
                else if(currentCell === 0 && neighbors === 3)
                {
                    //becomes alive
                    this.worldBuffer[row][col] = 1;
                }
                //lives on or stays dead
                else
                {
                    //stays the same
                    this.worldBuffer[row][col] = currentCell;
                }
            }
        }
        let temp = this.world;
        this.world = this.worldBuffer;
        this.worldBuffer = temp;
    }
}