import { html, list, id, text, attribute } from '../../../lib/v2/index.js';
import QUnit from 'qunit';

function todoApp() {
    const view = html`<div>
        <h2>${text('title', "My Todo's")}</h2>
		<ol>${list('todos', 
            /**
             * @param {string} text
             */
			text => html`<li>${text}
                <button>delete</button>
			</li>`,
		)}</ol>
        <form ${id('newTodoForm')}>
            <input type='text' value=${attribute('newTodoText', '')} />
            <button type='submit' value='add' ${id('submitButton')}>Add</button>
        </form>
    </div>`;

    view.data.newTodoForm.onsubmit = event => {
		event.preventDefault();
        view.data.todos.push('' + view.data.newTodoText);
        view.data.newTodoText = '';
    };

    return view;
}

QUnit.module('v2', () => {
    QUnit.module('examples', () => {
        QUnit.test('todo app', assert => {
            const app = todoApp();

			// forms need to be in the DOM to be submitted. else, the browser
			// refuses to handle the submit event.
			// see: https://stackoverflow.com/a/42081856/779572
			document.body.appendChild(app);

            app.data.todos = [
                'get things done',
                'get more things done',
            ];
            console.log('' + app.innerHTML);

			app.data.newTodoText = 'relax';
            console.log('' + app.innerHTML);
			app.data.submitButton.click();

			// huh ... why is this wrong?
            console.log('' + app.innerHTML);

			assert.deepEqual(
				app.data.todos,
				[
					'get things done',
					'get more things done',
					'relax'
				],
				"Final todos match initial todos plus submitted todo"
			);

			// document.body.removeChild(app);
        });
    });
});
