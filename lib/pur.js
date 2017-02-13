'use strict';

class DOMComponent {
	constructor(element) {
		this.currentElement = element;
		this.renderedChildren = null;
		this.node = null;
	}

	getHostNode() {
		return this.node;
	}

	/**
  * 1. updating the DOM attributes
  * 2. update their children
  */
	receiveComponent(nextElement) {
		var prevRenderedChildren = this.renderedChildren;
		var prevChildren = this.currentElement.props.children;
		var nextChildren = nextElement.props.children;
		var nextRenderedChildren = [];

		var operationQueue = [];

		var prevChild, prevNode, nextNode;
		nextChildren.forEach(function (nextChild, i) {
			prevChild = prevRenderedChildren[i];
			if (!prevChild) {
				nextChild = instantiateComponent(nextChild);
				nextNode = nextChild.mountComponent();

				operationQueue.push({
					type: 'ADD',
					node: nextNode
				});
				nextRenderedChildren.push(nextChild);
				return;
			}

			var canUpdate = prevChildren[i].type === nextChild.type;

			if (!canUpdate) {
				prevNode = prevChild.node;
				prevChild.unmountComponent();

				nextChild = instantiateComponent(nextChild);
				nextNode = nextChild.mountComponent();

				operationQueue.push({
					type: 'REPLACE',
					prevNode,
					nextNode
				});
				nextRenderedChildren.push(nextChild);
			}
		});

		prevRenderedChildren.slice(nextChildren.length).forEach(function (prevChild) {
			prevNode = prevChild.node;
			prevChild.unmountComponent();
			operationQueue.push({
				type: 'REMOVE',
				node: prevNode
			});
		});

		this.renderedChildren = nextRenderedChildren;

		while (operationQueue.length > 0) {
			var operation = operationQueue.shift();
			switch (operation.type) {
				case 'ADD':
					this.node.appendChild(operation.node);
					break;
				case 'REPLACE':
					this.node.replaceChild(operation.nextNode, operation.prevNode);
					break;
				case 'REMOVE':
					this.node.removeChild(operation.node);
					break;
			}
		}
	}

	// use document.createElement
	mountComponent() {
		var element = this.currentElement;
		var tag = element.type;
		var children = element.props.children;

		var node = document.createElement(tag);
		this.node = node;
		var renderedChildren = this.renderedChildren = children.map(instantiateComponent);

		renderedChildren.forEach(function (child) {
			node.appendChild(child.mountComponent());
		});
		return node;
	}

	unmountComponent() {
		var renderedChildren = this.renderedChildren;
		renderedChildren.forEach(function (child) {
			child.unmountComponent();
		});
	}
}

class CompositeComponent {
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
		this.renderedComponent = renderedComponent;
		var markup = renderedComponent.mountComponent();
		return markup;
	}

	unmountComponent() {
		var renderedComponent = this.renderedComponent;
		renderedComponent.unmountComponent();
	}
}

class ReactDOMTextComponent {
	constructor(element) {
		this.currentElement = '' + element;
		this.node = null;
		// this._rootNodeID = null;
	}

	receiveComponent(nextElement) {
		console.log(nextElement);
	}

	// use document.createElement
	mountComponent() {
		var node = document.createElement('span');
		node.innerText = this.currentElement;
		this.node = node;
		return node;
	}

	unmountComponent() {}

	// use html string
	// mountComponent(rootID) {
	// 	this._rootNodeID = rootID;
	// 	return (
	// 		'<span data-reactid="' + rootID + '">' + this.currentElement + '</span>'
	// 	)
	// }
}

/**
 * 1. host Component
 * 2. Composite Component
 */
function instantiateComponent(node) {
	if (typeof node == 'string' || typeof node == 'number') {
		return new ReactDOMTextComponent(node);
	}

	// platform-specific(host)
	if (typeof node == 'object' && typeof node.type == 'string') {
		return new DOMComponent(node);
	}

	// user-defined(composite)
	if (typeof node == 'object' && typeof node.type == 'function') {
		return new CompositeComponent(node);
	}
}

/**
 * @author monkindey
 * @date 2017.2.9
 * @description React Slim Version
 */

// console.log(123123);

function Component(props) {
	this.props = props;
}

Component.prototype.setState = function () {};

Component.prototype.isReactComponent = {};

function mixSpecIntoComponent(Constructor, spec) {
	var proto = Constructor.prototype;

	for (var name in spec) {
		proto[name] = spec[name];
	}
}

var Pur = {
	Component: Component,

	// will be deprecated
	createClass: function (spec) {
		var Constructor = function (props) {
			this.props = this.props;
			this.state = this.getInitialState ? this.getInitialState() : null;
		};

		Constructor.prototype = new Component();
		Constructor.prototype.Constructor = Constructor;
		mixSpecIntoComponent(Constructor, spec);

		return Constructor;
	},

	// Element represented by type and props
	createElement: function (type, config, children) {
		var propName;
		var props = {};

		if (config != null) {
			for (propName in config) {
				if (config.hasOwnProperty(propName)) {
					props[name] = config[propName];
				}
			}
		}

		var childrenLength = arguments.length - 2;
		if (childrenLength === 1) {
			props.children = Array.isArray(children) ? children : [children];
		} else if (childrenLength > 1) {
			var childArray = Array(childrenLength);
			for (var i = 0; i < childrenLength; i++) {
				childArray[i] = arguments[i + 2];
			}
			props.children = childArray;
		}

		return {
			type: type,
			props: props
		};
	},

	unmountComponentAtNode: function (container) {
		var node = container.firstChild;
		var rootComponent = node._internalInstance;

		rootComponent.unmountComponent();
		node.innerHTML = '';
	},

	render: function (element, container) {
		// check if exist the component
		if (container.firstChild) {
			var prevRootComponent = container._internalInstance;
			var prevElement = prevRootComponent.currentElement;

			if (prevElement.type === element.type) {
				prevRootComponent.receiveComponent(element);
				return;
			}

			Pur.unmountComponentAtNode(container);
		}

		var componentInstance = instantiateComponent(element);
		var markup = componentInstance.mountComponent();
		container._internalInstance = componentInstance;
		// 1. use innerHTML
		// container.innerHTML = markup;

		// 2. use document
		container.appendChild(markup);
	}
};

module.exports = Pur;
