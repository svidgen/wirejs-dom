import { html, list, id, text, attribute } from '../../../lib/v2/index.js';
import QUnit from 'qunit';

QUnit.module('v2', () => {
	QUnit.module('examples', () => {
		QUnit.test('todo app - external handler', assert => {
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
					view.data.todos.push(view.data.newTodoText);
					view.data.newTodoText = '';
				};

				return view;
			}

			const app = todoApp();

			// forms need to be in the DOM to be submitted. else, the browser
			// refuses to handle the submit event.
			// see: https://stackoverflow.com/a/42081856/779572
			document.body.appendChild(app);

			app.data.todos = [
				'get things done',
				'get more things done',
			];

			app.data.newTodoText = 'relax';
			app.data.submitButton.click();

			assert.deepEqual(
				app.data.todos,
				[
					'get things done',
					'get more things done',
					'relax'
				],
				"Final todos match initial todos plus submitted todo"
			);

			assert.equal(
				app.innerHTML.replace(/^\s+/gm, '').trim(),
				`<h2>My Todo's</h2>
					<ol><li>get things done
							<button>delete</button>
						</li><li>get more things done
							<button>delete</button>
						</li><li>relax
							<button>delete</button>
					</li></ol>
					<form data-id="newTodoForm">
						<input type="text" value="">
						<button type="submit" value="add" data-id="submitButton">Add</button>
					</form>`.replace(/^\s+/gm, '').trim(),
				"app innerHTML matches expected HTML"
			);

			document.body.removeChild(app);
		});

		QUnit.test('todo app - internal handler', assert => {
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
					<form onsubmit=${event => {
						event.preventDefault();
						view.data.todos.push(view.data.newTodoText);
						view.data.newTodoText = '';
					}}>
						<input type='text' value=${attribute('newTodoText', '')} />
						<button type='submit' value='add' ${id('submitButton')}>Add</button>
					</form>
				</div>`;

				return view;
			}

			const app = todoApp();

			// forms need to be in the DOM to be submitted. else, the browser
			// refuses to handle the submit event.
			// see: https://stackoverflow.com/a/42081856/779572
			document.body.appendChild(app);

			app.data.todos = [
				'get things done',
				'get more things done',
			];

			app.data.newTodoText = 'relax';
			app.data.submitButton.click();

			assert.deepEqual(
				app.data.todos,
				[
					'get things done',
					'get more things done',
					'relax'
				],
				"Final todos match initial todos plus submitted todo"
			);

			assert.equal(
				app.innerHTML.replace(/^\s+/gm, '').trim(),
				`<h2>My Todo's</h2>
					<ol><li>get things done
							<button>delete</button>
						</li><li>get more things done
							<button>delete</button>
						</li><li>relax
							<button>delete</button>
					</li></ol>
					<form>
						<input type="text" value="">
						<button type="submit" value="add" data-id="submitButton">Add</button>
					</form>`.replace(/^\s+/gm, '').trim(),
				"app innerHTML matches expected HTML"
			);

			document.body.removeChild(app);
		});
	});
});
