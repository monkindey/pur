import instantiateComponent from './instantiateComponent';

export default class DOMComponent {
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
		nextChildren.forEach(function(nextChild, i) {
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

			prevChild.receiveComponent(nextChild);
			nextRenderedChildren.push(nextChild);
		});

		prevRenderedChildren
			.slice(nextChildren.length)
			.forEach(function(prevChild) {
				prevNode = prevChild.node;
				prevChild.unmountComponent();
				operationQueue.push({
					type: 'REMOVE',
					node: prevNode
				})
			})

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
		var props = element.props;

		var node = document.createElement(tag);
		this.node = node;

		for (var p in props) {
			if (p === 'children') {
				continue;
			}

			node.setAttribute(p, props[p]);
		}

		var renderedChildren = this.renderedChildren = children.map(instantiateComponent);

		renderedChildren.forEach(function(child) {
			node.appendChild(child.mountComponent());
		});
		return node;
	}

	unmountComponent() {
		var renderedChildren = this.renderedChildren;
		renderedChildren.forEach(function(child) {
			child.unmountComponent();
		})
	}
}