const ElementBehaviors = {
    sand: {
        density: 1600, // kg/m³
        state: 'solid',
        temperatureEffect: 0,
        meltingPoint: 1700, // °C
        update(simulation, x, y) {
            // Try to move down
            if (!simulation.getCell(x, y + 1)) {
                simulation.nextGrid[simulation.getIndex(x, y + 1)] = 'sand';
                simulation.nextGrid[simulation.getIndex(x, y)] = null;
                return;
            }

            // Try to move diagonally
            const direction = Math.random() < 0.5 ? -1 : 1;
            if (!simulation.getCell(x + direction, y + 1)) {
                simulation.nextGrid[simulation.getIndex(x + direction, y + 1)] = 'sand';
                simulation.nextGrid[simulation.getIndex(x, y)] = null;
                return;
            }

            // Check temperature for melting
            const temp = simulation.getTemperature(x, y);
            if (temp >= this.meltingPoint) {
                simulation.nextGrid[simulation.getIndex(x, y)] = 'lava';
            }
        }
    },

    water: {
        density: 1000, // kg/m³
        state: 'liquid',
        temperatureEffect: -0.1,
        freezingPoint: 0, // °C
        boilingPoint: 100, // °C
        update(simulation, x, y) {
            const temp = simulation.getTemperature(x, y);

            // Check temperature for state changes
            if (temp <= this.freezingPoint) {
                simulation.nextGrid[simulation.getIndex(x, y)] = 'ice';
                return;
            }
            if (temp >= this.boilingPoint) {
                simulation.nextGrid[simulation.getIndex(x, y)] = 'steam';
                return;
            }

            // Try to move down
            if (!simulation.getCell(x, y + 1)) {
                simulation.nextGrid[simulation.getIndex(x, y + 1)] = 'water';
                simulation.nextGrid[simulation.getIndex(x, y)] = null;
                return;
            }

            // Try to move horizontally
            const direction = Math.random() < 0.5 ? -1 : 1;
            if (!simulation.getCell(x + direction, y)) {
                simulation.nextGrid[simulation.getIndex(x + direction, y)] = 'water';
                simulation.nextGrid[simulation.getIndex(x, y)] = null;
            }
        }
    },

    steam: {
        density: 0.6, // kg/m³
        state: 'gas',
        temperatureEffect: 0.1,
        condensationPoint: 99, // °C
        update(simulation, x, y) {
            const temp = simulation.getTemperature(x, y);

            // Check temperature for condensation
            if (temp <= this.condensationPoint) {
                simulation.nextGrid[simulation.getIndex(x, y)] = 'water';
                return;
            }

            // Try to move up
            if (!simulation.getCell(x, y - 1)) {
                simulation.nextGrid[simulation.getIndex(x, y - 1)] = 'steam';
                simulation.nextGrid[simulation.getIndex(x, y)] = null;
                return;
            }

            // Try to move diagonally up
            const direction = Math.random() < 0.5 ? -1 : 1;
            if (!simulation.getCell(x + direction, y - 1)) {
                simulation.nextGrid[simulation.getIndex(x + direction, y - 1)] = 'steam';
                simulation.nextGrid[simulation.getIndex(x, y)] = null;
            }
        }
    },

    ice: {
        density: 917, // kg/m³
        state: 'solid',
        temperatureEffect: -0.2,
        meltingPoint: 0, // °C
        update(simulation, x, y) {
            const temp = simulation.getTemperature(x, y);

            // Check temperature for melting
            if (temp > this.meltingPoint) {
                simulation.nextGrid[simulation.getIndex(x, y)] = 'water';
            }
        }
    },

    lava: {
        density: 3100, // kg/m³
        state: 'liquid',
        temperatureEffect: 2,
        solidificationPoint: 1200, // °C
        update(simulation, x, y) {
            const temp = simulation.getTemperature(x, y);

            // Check temperature for solidification
            if (temp < this.solidificationPoint) {
                simulation.nextGrid[simulation.getIndex(x, y)] = 'stone';
                return;
            }

            // Try to move down
            if (!simulation.getCell(x, y + 1)) {
                simulation.nextGrid[simulation.getIndex(x, y + 1)] = 'lava';
                simulation.nextGrid[simulation.getIndex(x, y)] = null;
                return;
            }

            // Try to move horizontally (slower than water)
            if (Math.random() < 0.3) {
                const direction = Math.random() < 0.5 ? -1 : 1;
                if (!simulation.getCell(x + direction, y)) {
                    simulation.nextGrid[simulation.getIndex(x + direction, y)] = 'lava';
                    simulation.nextGrid[simulation.getIndex(x, y)] = null;
                }
            }
        }
    },

    stone: {
        density: 2700, // kg/m³
        state: 'solid',
        temperatureEffect: 0,
        meltingPoint: 1700, // °C
        update(simulation, x, y) {
            const temp = simulation.getTemperature(x, y);

            // Check temperature for melting
            if (temp >= this.meltingPoint) {
                simulation.nextGrid[simulation.getIndex(x, y)] = 'lava';
            }
        }
    },

    wood: {
        density: 700, // kg/m³
        state: 'solid',
        temperatureEffect: 0,
        ignitionPoint: 300, // °C
        update(simulation, x, y) {
            const temp = simulation.getTemperature(x, y);

            // Check temperature for burning
            if (temp >= this.ignitionPoint) {
                simulation.nextGrid[simulation.getIndex(x, y)] = 'fire';
            }
        }
    },

    fire: {
        density: 0.3, // kg/m³
        state: 'plasma',
        temperatureEffect: 5,
        duration: 100, // frames
        update(simulation, x, y) {
            // Random chance to spread fire
            const neighbors = [
                [x-1, y], [x+1, y],
                [x, y-1], [x, y+1]
            ];

            for (const [nx, ny] of neighbors) {
                if (!simulation.isValidPosition(nx, ny)) continue;
                const neighbor = simulation.getCell(nx, ny);
                if (neighbor === 'wood' && Math.random() < 0.1) {
                    simulation.nextGrid[simulation.getIndex(nx, ny)] = 'fire';
                }
            }

            // Random chance to extinguish
            if (Math.random() < 0.05) {
                simulation.nextGrid[simulation.getIndex(x, y)] = null;
            }

            // Try to move up
            if (!simulation.getCell(x, y - 1)) {
                simulation.nextGrid[simulation.getIndex(x, y - 1)] = 'fire';
                simulation.nextGrid[simulation.getIndex(x, y)] = null;
            }
        }
    }
};

export default ElementBehaviors; 