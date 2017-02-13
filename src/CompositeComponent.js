import instantiateComponent from './instantiateComponent';

export default class CompositeComponent {
	constructor(element) {
		this.currentElement = element;
		// for use during updates
		this.publicInstance = null;
		this.renderedComponent = null;
	}

	getHostNode() {
		this.renderedComponent.getHostNode();
	}

	// update
	// Element ==> Component
	receiveComponent(nextElement) {
		var prevElement = this.currentElement;
		// Instance
		var publicInstance = this.publicInstance;
		// Component
		var prevRenderedComponent = this.renderedComponent;
		// Element
		var prevRenderedElement = prevRenderedComponent.currentElement;

		this.currentElement = nextElement;
		var type = nextElement.type;

		var nextRenderedElement;
		nextRenderedElement = publicInstance.render();

		if (prevRenderedElement.type === nextRenderedElement.type) {
			// debugger;
			prevRenderedComponent.receiveComponent(nextRenderedElement);
			return;
		}

		// when the type different we should remove the old node;
		var prevNode = prevRenderedComponent.getHostNode();
		prevRenderedComponent.unmountComponent();

		var nextRenderedComponent = instantiateComponent(nextRenderedElement);
		var nextNode = nextRenderedComponent.mountComponent();
		this.renderedComponent = nextRenderedComponent;

		prevNode.parentNode.replaceChild(nextNode, prevNode);
	}

	mountComponent() {
		var Component = this.currentElement.type;
		// TODO: function Component
		var inst = new Component();
		var renderedElement = inst.render();
		var renderedComponent = instantiateComponent(renderedElement);

		this.publicInstance = inst;

		// for setState
		inst._internalInstance = this;
		this.renderedComponent = renderedComponent;
		var markup = renderedComponent.mountComponent();
		return markup;
	}

	unmountComponent() {
		var renderedComponent = this.renderedComponent;
		renderedComponent.unmountComponent();
	}
}