import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import CreateCourse from './CreateCourse'
import Dashboard from './CourseDashboard';

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/course'>
          <Dashboard/>
        </Route>
        <Route path='/createcourse'>
          <CreateCourse/>
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
