import { useRoutes } from 'react-router-dom';
import Start from './features/inspection/pages/Start';
import Vehicle from './features/inspection/pages/Vehicle';
import Exterior from './features/inspection/pages/Exterior';
import Rust from './features/inspection/pages/Rust';
import EngineBay from './features/inspection/pages/EngineBay';
import Interior from './features/inspection/pages/Interior';
import RoadTest from './features/inspection/pages/RoadTest';
import PostDrive from './features/inspection/pages/PostDrive';
import Review from './features/inspection/pages/Review';
import Export from './features/inspection/pages/Export';

export default function Routes(){
  return useRoutes([
  { path: '/', element: <Start /> },
  { path: '/start', element: <Start /> },
  { path: '/vehicle', element: <Vehicle /> },
  { path: '/exterior', element: <Exterior /> },
  { path: '/rust', element: <Rust /> },
  { path: '/engine', element: <EngineBay /> },
  { path: '/interior', element: <Interior /> },
  { path: '/road', element: <RoadTest /> },
  { path: '/post', element: <PostDrive /> },
  { path: '/review', element: <Review /> },
  { path: '/export', element: <Export /> }
  ]);
}
