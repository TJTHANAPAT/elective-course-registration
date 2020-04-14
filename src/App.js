import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import CreateCourse from './CreateCourse'
import Dashboard from './CourseDashboard';
import Enroll from './Enroll';
import GetStudentData from './GetStudentData';

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/search/'>
          <GetStudentData/>
        </Route>
        <Route path='/course/enroll'>
          <Enroll/>
        </Route>
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
