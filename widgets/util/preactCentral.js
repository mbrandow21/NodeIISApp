import {
  h,
  render,
  createContext,
} from "preact";
import {
  useState,
  useEffect,
  useContext,
} from "preact/hooks";
import htm from "htm";
const html = htm.bind(h);

export { h, render, html, useState, useEffect, createContext, useContext };
