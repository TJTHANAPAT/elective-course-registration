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
import Admin from './Admin';
import GradeConfig from './GradeConfig';
import Homepage from './Homepage';
import CourseYearConfig from './CourseYearConfig';
import EditCourse from './EditCourse';
import ViewCourse from './ViewCourse';
import CourseManagement from './CourseManagement';

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
        <Route path='/admin/createcourse'>
          <CreateCourse/>
        </Route>
        <Route path='/admin/viewcourse'>
          <ViewCourse/>
        </Route>
        <Route path='/admin/editcourse'>
          <EditCourse/>
        </Route>
        <Route path='/admin/system/config/year'>
          <CourseYearConfig/>
        </Route>
        <Route path='/admin/config/grade'>
          <GradeConfig/>
        </Route>
        <Route path='/admin/course'>
          <CourseManagement/>
        </Route>
        <Route path='/admin'>
          <Admin/>
        </Route>
        <Route path='/'>
          <Homepage/>
        </Route>
      </Switch>
    </Router>
    
  );
}

export default App;
