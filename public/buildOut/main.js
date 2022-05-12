'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var root = ReactDOM.createRoot(document.getElementById('main'));

function getAPI(name) {
    return new Promise(function (resolve, reject) {
        try {
            fetch('https://opendata.resas-portal.go.jp/' + name, {
                headers: { 'X-API-KEY': 'RWivhNbgzvzAoMy3QjG29zorNPDoqeFgeCADLZMt' }
            }).then(function (respond) {
                resolve(respond.json());
            });
        } catch (e) {
            reject(null);
        }
    });
}

getAPI('api/v1/prefectures').then(function (json) {
    if (json != null) {
        json.result.map(function (pref) {
            return _react2.default.createElement(
                PrefButton,
                null,
                pref
            );
        });
        root.render(_react2.default.createElement(
            LineChart,
            {
                width: 400,
                height: 400,
                data: data,
                margin: { top: 5, right: 20, left: 10, bottom: 5 }
            },
            _react2.default.createElement(XAxis, { dataKey: 'name' }),
            _react2.default.createElement(Tooltip, null),
            _react2.default.createElement(CartesianGrid, { stroke: '#f5f5f5' }),
            _react2.default.createElement(Line, { type: 'monotone', dataKey: 'uv', stroke: '#ff7300', yAxisId: 0 }),
            _react2.default.createElement(Line, { type: 'monotone', dataKey: 'pv', stroke: '#387908', yAxisId: 1 })
        ));
    }
});

var PrefButton = function (_React$Component) {
    _inherits(PrefButton, _React$Component);

    _createClass(PrefButton, [{
        key: '_knsIsSelected',
        get: function get() {
            return this.state.value;
        }
    }]);

    function PrefButton(props) {
        _classCallCheck(this, PrefButton);

        var _this = _possibleConstructorReturn(this, (PrefButton.__proto__ || Object.getPrototypeOf(PrefButton)).call(this, props));

        _this.state = { value: '' };
        _this._knsItem = _this.props.children;
        _this._knsId = "pref" + _this._knsItem.prefCode;
        return _this;
    }

    _createClass(PrefButton, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'form',
                null,
                _react2.default.createElement(
                    'label',
                    null,
                    _react2.default.createElement('input', { type: 'checkbox', name: 'pref',
                        onChange: this.handleChange.bind(this),
                        value: this._knsId
                    }),
                    this._knsItem.prefName
                )
            );
        }
    }, {
        key: 'handleChange',
        value: function handleChange(event) {
            this.setState({ value: event.target.value });
        }
    }]);

    return PrefButton;
}(_react2.default.Component);