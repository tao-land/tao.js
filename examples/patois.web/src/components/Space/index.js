import React from 'react';
import TAO, { AppCtx } from '@tao.js/core';
import {
  Adapter,
  Reactor,
  DataHandler,
  SwitchHandler,
  RenderHandler
} from '@tao.js/react';
import List from './List';
import View from './View';
import Form from './Form';
import ErrorMessage from './ErrorMessage';

TAO.addInlineHandler(
  { t: 'Space', a: 'Enter', o: 'Portal' },
  (tao, { Space }) => {
    return new AppCtx('Space', 'View', 'Portal', { Space });
  }
);

const spaceAdapter = new Adapter(TAO);
spaceAdapter
  .setDefaultCtx({ term: 'Space', orient: 'Portal' })
  .addComponentHandler({ action: 'List' }, List)
  .addComponentHandler({ action: 'View' }, View)
  .addComponentHandler({ action: ['New', 'Edit'] }, Form);

const messageAdapter = new Adapter(TAO);
messageAdapter.addComponentHandler({ action: 'Fail' }, ErrorMessage);

const SpaceContainer = () => (
  <div>
    <Reactor key="spaceMessages" adapter={messageAdapter} />
    <Reactor key="spaceComponents" adapter={spaceAdapter} />
  </div>
);

export default SpaceContainer;

const SpaceAltContainer = () => (
  <DataHandler
    name="spaceList"
    term="Space"
    action="List"
    orient="Portal"
    default={() => ({ list: [] })}
    handler={(tao, data, set) => ({ list: data.Space })}
  >
    <SwitchHandler term="Space" orient="Portal">
      <RenderHandler context="spaceList" action="List">
        {(tao, data, spaceList) => <List Space={spaceList.list} />}
      </RenderHandler>
      <RenderHandler action="View">
        {(tao, data) => <View Space={data.Space} />}
      </RenderHandler>
      <RenderHandler action="Edit">
        {() => <div>You must save for changes to take effect.</div>}
      </RenderHandler>
      <RenderHandler action={['New', 'Edit']}>
        {(tao, data) => <Form Space={data.Space} a={tao.a} />}
      </RenderHandler>
      some random text
      <div>some more text</div>
      <RenderHandler action="View">
        {(tao, data) => <View Space={data.Space} />}
      </RenderHandler>
    </SwitchHandler>
  </DataHandler>
);

export { SpaceAltContainer };
