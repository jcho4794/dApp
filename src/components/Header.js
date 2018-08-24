import { Affix, Menu, Popover, Icon } from 'antd';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import Media from 'react-media';

import logo from '../img/market-logo-white.png';
import '../less/Header.less';

// const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

/*const subMenuItems = [
  { name: 'Simplified Deploy', to: '/contract/deploy?mode=simplified' },
  { name: 'Guided Deploy', to: '/contract/deploy?mode=guided' },
  { name: 'Quick Deploy', to: '/contract/deploy?mode=quick' }
];*/

const mainMenuItems = [
  { name: 'Deploy Contracts', to: '/contract/deploy?mode=simplified' },
  { name: 'Explore Contracts', to: '/contract/explorer' },
  { name: 'Test Query', to: '/test' },
  {
    name: 'Documentation',
    to: 'http://docs.marketprotocol.io',
    target: '_blank'
  }
];

class Header extends Component {
  render() {
    const path = this.props.location.pathname + this.props.location.search;

    return (
      <Affix>
        <header id="header">
          <Link to="/" id="logo">
            <img src={logo} alt="Market Protocol Logo" />
          </Link>
          <Media query="(min-width: 768px)">
            {matches =>
              matches ? (
                <Menu
                  mode="horizontal"
                  className="menu-site"
                  id="nav"
                  selectedKeys={[path]}
                >
                  {/*<SubMenu title="Deploy Contracts">*/}
                  {/*{subMenuItems.map(item => (*/}
                  {/*<MenuItem key={item.to}>*/}
                  {/*<Link to={item.to}>{item.name}</Link>*/}
                  {/*</MenuItem>*/}
                  {/*))}*/}
                  {/*</SubMenu>*/}
                  {mainMenuItems.map(item => (
                    <MenuItem key={item.to}>
                      <Link to={item.to} target={item.target}>
                        {item.name}
                      </Link>
                    </MenuItem>
                  ))}
                </Menu>
              ) : (
                <Popover
                  id="mobile-popover"
                  placement="bottomRight"
                  trigger="click"
                  content={
                    <Menu mode="inline" id="nav-mobile" selectedKeys={[path]}>
                      {/*<SubMenu title="Deploy Contracts">*/}
                      {/*{subMenuItems.map(item => (*/}
                      {/*<MenuItem key={item.to}>*/}
                      {/*<Link to={item.to}>{item.name}</Link>*/}
                      {/*</MenuItem>*/}
                      {/*))}*/}
                      {/*</SubMenu>*/}
                      {mainMenuItems.map(item => (
                        <MenuItem key={item.to}>
                          <Link to={item.to} target={item.target}>
                            {item.name}
                          </Link>
                        </MenuItem>
                      ))}
                    </Menu>
                  }
                >
                  <div className="mobile-button">
                    <Icon className="iconHamburger" type="menu" />
                  </div>
                </Popover>
              )
            }
          </Media>
        </header>
      </Affix>
    );
  }
}

export default withRouter(Header);
