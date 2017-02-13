export default class ReactDOMTextComponent {
	constructor(element) {
		this.currentElement = '' + element;
		this.node = null;
		// this._rootNodeID = null;
	}

	receiveComponent(nextElement) {
		var prevElement = this.currentElement;
		if (prevElement !== nextElement) {
			this.node.innerText = nextElement;
			this.currentElement = nextElement;
		}
	}

	// use document.createElement
	mountComponent() {
		var node = document.createElement('span');
		node.innerText = this.currentElement;
		this.node = node;
		return node;
	}

	unmountComponent() {

	}

	// use html string
	// mountComponent(rootID) {
	// 	this._rootNodeID = rootID;
	// 	return (
	// 		'<span data-reactid="' + rootID + '">' + this.currentElement + '</span>'
	// 	)
	// }
}