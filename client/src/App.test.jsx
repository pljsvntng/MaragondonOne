// Integration test: renders the real client against the real Express API (no mocked responses).
import {describe,it,expect,beforeAll,afterAll} from 'vitest';import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {createRequire} from 'module';import App from './App.jsx';
const require=createRequire(import.meta.url);let srv;
beforeAll(async()=>{const app=require('../../server/index.js');srv=await new Promise(r=>{const s=app.listen(4210,()=>r(s))});
  const f=globalThis.fetch;globalThis.fetch=(u,o)=>f(String(u).startsWith('/')?'http://localhost:4210'+u:u,o)});
afterAll(()=>{cleanup();srv.close()});
describe('MaragondonOne client',()=>{
  it('shows backend-derived data across pages',async()=>{
    render(<App/>);
    expect(await screen.findByText(/Rapid Barangay Response/)).toBeTruthy();
    await waitFor(()=>expect(screen.getByText('SJF')).toBeTruthy());              // recommended protocol from API
    fireEvent.click(screen.getAllByText('Department Dispatch Center')[0]);
    await waitFor(()=>expect(screen.getByText('Execution timeline')).toBeTruthy());
    fireEvent.click(screen.getByRole('button',{name:'MLFQ'}));
    await waitFor(()=>expect(screen.getByText('Combined Master Timeline')).toBeTruthy());
    expect(screen.getByText(/Level 3 · SJF/)).toBeTruthy();
    fireEvent.click(screen.getAllByText('Algorithm Efficiency Benchmark')[0]);
    await waitFor(()=>expect(screen.getAllByText('Inspect timeline').length).toBe(8));
    fireEvent.click(screen.getAllByText('Citizen Service Portal')[0]);
    fireEvent.change(screen.getByLabelText('Report scope'),{target:{value:'all'}});
    await waitFor(()=>expect(screen.getAllByText('Scheduled').length).toBe(5));
  });
  it('rejects an invalid ticket with server validation errors',async()=>{
    fireEvent.click(screen.getAllByText('Department Dispatch Center')[0]);
    const bt=await screen.findAllByLabelText(/Service effort/);fireEvent.change(bt[0],{target:{value:'0'}});
    fireEvent.change(screen.getAllByLabelText(/Incident/)[0],{target:{value:'Test'}});
    fireEvent.click(screen.getByText('Add ticket').closest('div').querySelector('button.btn-p'));
    await waitFor(()=>expect(screen.getByRole('alert').textContent).toMatch(/burstTime/));
  });
});
