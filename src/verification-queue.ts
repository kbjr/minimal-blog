
import { store } from './storage';

store.events.on('mentions.create', (data) => {
	// todo: check/update queue state
});

store.events.on('mentions.update', (data) => {
	// todo: check/update queue state
});
