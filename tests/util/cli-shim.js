import { JSDOM } from 'jsdom';

const DOM = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
global.window = DOM.window
global.document = window.document;
global.Element = window.Element;
global.Node = window.Node;
global.NodeList = window.NodeList;
global.fixture = document.createElement('div');
document.body.appendChild(fixture);