import React from 'react';

const createStore = (rootReducer) => {
    let state;
    let listeners = [];

    const getState = () => state;

    const dispatch = (action) => {
        state = rootReducer(state, action);
        listeners.map(listener => {
            listener(state)
        });
    };

    const subscribe = (listener) => {
        listeners.push(listener);
    };

    dispatch({});

    return {getState, dispatch, subscribe}
};


const combineReducers = (reducers) => {
    const nextState = {};
    const reducerFunctions = {};
    const reducerKeys = Object.keys(reducers);

    reducerKeys.map(reducerKey => {
        if (typeof reducers[reducerKey] === "function") {
            reducerFunctions[reducerKey] = reducers[reducerKey];
        }
    });

    return (state = {}, action) => {
        Object.keys(reducerFunctions).map(reducerKey => {
            const reducer = reducerFunctions[reducerKey];
            nextState[reducerKey] = reducer(state[reducerKey], action);
        });
        return nextState;
    }
};

const connect = (mapStateToProps, mapDispatchToProps) => Component => {
    class Connect extends React.Component {
        constructor(props) {
            super(props);
            this.state = props.store.getState();
        }

        componentDidMount() {
            this.props.store.subscribe(state => {
                this.setState(state);
            })
        }

        withoutDispatch(data, datav) {
            if (data === null || data === undefined) {
                return false;
            }
            return data(datav)
        }

        render() {
            const {store} = this.props;
            return (
                <Component
                    {...this.props}
                    {...mapStateToProps(store.getState())}
                    {...this.withoutDispatch(mapDispatchToProps, store.dispatch)}
                />
            )

        }
    }

    return props => (
        <ReduxContext.Consumer>
            {store => <Connect {...props} store={store}/>}
        </ReduxContext.Consumer>
    );
};

const ReduxContext = React.createContext("redux");

const Provider = ({store, children}) => (
    <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>
);


export {createStore, combineReducers, connect, Provider};

