export class Base {
    constructor(nameOfComponent, action) {
        this.nameOfComponent = nameOfComponent;
        this.action = action;
    }
    addComponent() {
        console.log(`Component ${this.nameOfComponent} has been added`);
        return this.nameOfComponent;
    }

    removeComponent() {
        console.log(`Component ${this.nameOfComponent} has been removed`);
        return this.nameOfComponent;
    }
    actionOnComponent(action) {
        if (action === 'add') {
            return this.addComponent();
        } else if (action === 'remove') {
            return this.removeComponent();
        }
        return 'No valid action specified';
    }
    getFullListOfComponents() {
        let components = [];
        components.push(this.addComponent());
        console.log(components);
        return `Getting full list of components including: ${components}`;
    }
}
