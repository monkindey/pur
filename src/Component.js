export default class Component {
	constructor(props) {
		this.props = props;
	}

	setState(partialState) {
		this.state = partialState;
		this._internalInstance.receiveComponent(this._internalInstance.currentElement);
	}

	isReactComponent() {}
}