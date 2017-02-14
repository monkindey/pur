/**
 * @author monkindey
 * @date 2017.2.9
 * @description Pur
 * rollup tree shaking: import 不进来文件
 * rollup watch https://github.com/rollup/rollup/issues/284
 */

import instantiateComponent from './instantiateComponent';
import Component from './Component';

function mixSpecIntoComponent(Constructor, spec) {
	var proto = Constructor.prototype;

	for (var name in spec) {
		proto[name] = spec[name];
	}
}

var Pur = {
	Component: Component,

	// will be deprecated
	createClass: function(spec) {
		var Constructor = function(props) {
			this.props = this.props;
			this.state = this.getInitialState ? this.getInitialState() : null
		}

		Constructor.prototype = new Component();
		Constructor.prototype.Constructor = Constructor;
		mixSpecIntoComponent(Constructor, spec);

		return Constructor;
	},

	// Element represented by type and props
	createElement: function(type, config, children) {
		var propName;
		var props = {};

		if (config !== null) {
			for (propName in config) {
				if (config.hasOwnProperty(propName)) {
					props[propName] = config[propName];
				}
			}
		}

		var childrenLength = arguments.length - 2;
		if (childrenLength === 1) {
			props.children = Array.isArray(children) ? children : [children]
		} else if (childrenLength > 1) {
			var childArray = Array(childrenLength);
			for (var i = 0; i < childrenLength; i++) {
				childArray[i] = arguments[i + 2]
			}
			props.children = childArray;
		}

		return {
			type: type,
			props: props
		}
	},

	unmountComponentAtNode: function(container) {
		var node = container.firstChild;
		var rootComponent = node._internalInstance;

		rootComponent.unmountComponent();
		node.innerHTML = '';
	},

	render: function(element, container) {
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

export default Pur;