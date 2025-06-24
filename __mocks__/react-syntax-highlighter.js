// This is not a real mock.
// It is used to avoid errors when importing react-syntax-highlighter in tests.
// It does not provide any functionality. 
const React = require('react');

module.exports = {
    Prism: ({ children }) => React.createElement(React.Fragment, null, children),
    registerLanguage: jest.fn(),
};
