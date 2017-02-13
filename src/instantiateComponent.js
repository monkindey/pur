/**
 * 1. host Component
 * 2. Composite Component
 */
import DOMComponent from './DOMComponent';
import CompositeComponent from './CompositeComponent';
import DOMTextComponent from './DOMTextComponent';

export default function instantiateComponent(node) {
	if (typeof node == 'string' || typeof node == 'number') {
		return new DOMTextComponent(node)
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