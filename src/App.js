import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import CreateCourse from './CreateCourse'

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/createcourse'>
          <div>
            <h1>
              <CreateCourse/>
            </h1>
          </div>
        </Route>
        <Route path='/'>
          <div>
            <h1>Hello World!</h1>
          </div>
        </Route>
      </Switch>
    </Router>
    
  );
}

export default App;
