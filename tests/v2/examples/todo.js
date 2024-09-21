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
            </li>`
        )}</ol>
        <form ${id('newTodoForm')}>
            <input type='text' value=${attribute('newTodoText', '')} />
            <button type='submit' value='add'>Add</button>
        </form>
    </div>`;

    view.data.newTodoForm.onsubmit = () => {
        app.data.todos.push(app.data.newTodoText);
        app.data.newTodoText = '';
    };

    return view;
}

QUnit.module('v2', () => {
    QUnit.module('examples', () => {
        QUnit.module('todo app', () => {
            const app = todoApp();
            app.data.todos = [
                'get things done',
                'get more things done',
                'relax'
            ];
            console.log(app);
        });
    });
});