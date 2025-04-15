class Simulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = new Array(width * height).fill(null);
        this.nextGrid = new Array(width * height).fill(null);
        this.temperature = new Array(width * height).fill(20); // Default temperature 20°C
        this.lastUpdateTime = performance.now();
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.paused = false;
        this.selectedElement = 'sand';
        this.brushSize = 3;
        this.activeMods = new Set();
    }

    getIndex(x, y) {
        return y * this.width + x;
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    getCell(x, y) {
        if (!this.isValidPosition(x, y)) return null;
        return this.grid[this.getIndex(x, y)];
    }

    setCell(x, y, element) {
        if (!this.isValidPosition(x, y)) return;
        const index = this.getIndex(x, y);
        this.grid[index] = element;
    }

    getTemperature(x, y) {
        if (!this.isValidPosition(x, y)) return 20;
        return this.temperature[this.getIndex(x, y)];
    }

    setTemperature(x, y, temp) {
        if (!this.isValidPosition(x, y)) return;
        this.temperature[this.getIndex(x, y)] = temp;
    }

    update() {
        if (this.paused) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        // FPS calculation
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }

        // Copy current grid to next grid
        this.nextGrid = [...this.grid];

        // Update each cell
        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                const element = this.getCell(x, y);
                if (!element) continue;

                // Get behavior for this element
                const behavior = ElementBehaviors[element];
                if (behavior && behavior.update) {
                    behavior.update(this, x, y);
                }
            }
        }

        // Update temperatures
        this.updateTemperatures();

        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
    }

    updateTemperatures() {
        const newTemperature = [...this.temperature];
        const diffusionRate = 0.1;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const currentTemp = this.getTemperature(x, y);
                let totalDiff = 0;

                // Check neighboring cells
                const neighbors = [
                    [x-1, y], [x+1, y],
                    [x, y-1], [x, y+1]
                ];

                for (const [nx, ny] of neighbors) {
                    if (this.isValidPosition(nx, ny)) {
                        const neighborTemp = this.getTemperature(nx, ny);
                        totalDiff += (neighborTemp - currentTemp) * diffusionRate;
                    }
                }

                const element = this.getCell(x, y);
                if (element) {
                    const behavior = ElementBehaviors[element];
                    if (behavior && behavior.temperatureEffect) {
                        totalDiff += behavior.temperatureEffect;
                    }
                }

                newTemperature[this.getIndex(x, y)] = currentTemp + totalDiff;
            }
        }

        this.temperature = newTemperature;
    }

    draw(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const cellWidth = ctx.canvas.width / this.width;
        const cellHeight = ctx.canvas.height / this.height;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const element = this.getCell(x, y);
                if (!element) continue;

                const temp = this.getTemperature(x, y);
                ctx.fillStyle = this.getElementColor(element, temp);
                ctx.fillRect(
                    x * cellWidth,
                    y * cellHeight,
                    cellWidth,
                    cellHeight
                );
            }
        }
    }

    getElementColor(element, temperature) {
        // Get base color from CSS
        const tempElement = document.createElement('div');
        tempElement.className = element;
        document.body.appendChild(tempElement);
        const baseColor = window.getComputedStyle(tempElement).backgroundColor;
        document.body.removeChild(tempElement);

        // Adjust color based on temperature
        const rgb = baseColor.match(/\d+/g).map(Number);
        const tempFactor = (temperature - 20) / 100; // Normalize around room temperature
        
        if (tempFactor > 0) {
            // Hotter = more red
            rgb[0] = Math.min(255, rgb[0] + tempFactor * 100);
            rgb[1] = Math.max(0, rgb[1] - tempFactor * 50);
            rgb[2] = Math.max(0, rgb[2] - tempFactor * 50);
        } else {
            // Colder = more blue
            rgb[0] = Math.max(0, rgb[0] + tempFactor * 50);
            rgb[1] = Math.max(0, rgb[1] + tempFactor * 50);
            rgb[2] = Math.min(255, rgb[2] - tempFactor * 100);
        }

        return `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`;
    }

    // Save/Load functionality
    serialize() {
        return {
            width: this.width,
            height: this.height,
            grid: this.grid,
            temperature: this.temperature,
            activeMods: Array.from(this.activeMods)
        };
    }

    deserialize(data) {
        this.width = data.width;
        this.height = data.height;
        this.grid = data.grid;
        this.nextGrid = new Array(this.width * this.height).fill(null);
        this.temperature = data.temperature;
        this.activeMods = new Set(data.activeMods);
    }
}

// Export for module usage
export default Simulation; 