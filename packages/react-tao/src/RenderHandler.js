import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import cartesian from 'cartesian';

import { normalizeAC, cleanInput } from './helpers';
import { Context } from './Provider';

function recursiveContextGenerator(
  ctxList,
  getContext,
  children,
  tao,
  data,
  ctxIdx = 0,
  ctxDataArgs = []
) {
  const ctxName = ctxList[ctxIdx];
  const context = getContext(ctxName);
  if (ctxList.length > ctxIdx + 1) {
    return (
      <context.Consumer name={`${ctxName}.Consumer`}>
        {ctxData => {
          ctxDataArgs.push(ctxData);
          return recursiveContextGenerator(
            ctxList,
            getContext,
            children,
            tao,
            data,
            ctxIdx + 1,
            ctxDataArgs
          );
        }}
      </context.Consumer>
    );
  }
  return (
    <context.Consumer name={`${ctxName}.Consumer`}>
      {ctxData => {
        ctxDataArgs.push(ctxData);
        return children(tao, data, ...ctxDataArgs);
      }}
    </context.Consumer>
  );
}

export default class RenderHandler extends Component {
  static contextType = Context;

  static propTypes = {
    term: PropTypes.any,
    action: PropTypes.any,
    orient: PropTypes.any,
    context: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    children: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    let { shouldRender } = props;
    shouldRender = typeof shouldRender === 'undefined' ? false : shouldRender;
    this.state = { shouldRender };
    this._refreshOn = null;
  }

  componentWillMount() {
    console.log('RenderHandler::props:', this.props);
    const trigram = cleanInput(normalizeAC(this.props));
    console.log('RenderHandler::context:', this.context);
    const { TAO } = this.context;
    const permutations = cartesian(trigram);
    if (permutations.length) {
      permutations.forEach(({ term, action, orient }) =>
        TAO.addInlineHandler({ term, action, orient }, this.handleRender)
      );
    }
    const { refreshOn } = this.props;
    if (refreshOn) {
      const refresh = cleanInput(normalizeAC(refreshOn));
      if (!Object.keys(refresh).length) {
        return;
      }
      this._refreshOn = cartesian({ ...trigram, ...refresh });
      this._refreshOn.forEach(({ term, action, orient }) =>
        TAO.addInlineHandler({ term, action, orient }, this.handleRender)
      );
    }
  }

  componentWillUnmount() {
    const trigram = cleanInput(normalizeAC(this.props));
    const { TAO } = this.context;
    const permutations = cartesian(trigram);
    if (permutations.length) {
      permutations.forEach(({ term, action, orient }) =>
        TAO.removeInlineHandler({ term, action, orient }, this.handleRender)
      );
    }
    if (this._refreshOn && this._refreshOn.length) {
      this._refreshOn.forEach(({ term, action, orient }) =>
        TAO.removeInlineHandler({ term, action, orient }, this.handleRender)
      );
    }
  }

  handleRender = (tao, data) => {
    // TODO: allow shouldRender prop be a function called
    this.setState({ tao, data, shouldRender: true });
  };

  render() {
    const { context, children } = this.props;
    const { shouldRender, tao, data } = this.state;
    const { getDataContext } = this.context;

    if (!shouldRender) {
      return null;
    }
    if (!context) {
      return <Fragment>{children(tao, data)}</Fragment>;
    }
    const ctxList = Array.isArray(context) ? context : [context];
    return recursiveContextGenerator(
      ctxList,
      getDataContext,
      children,
      tao,
      data
    );
  }
}
