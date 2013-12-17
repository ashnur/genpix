@media screen and (max-width: {{=it.maxWidth}}px) { /* Specific to this particular image */
  {{~it.files :classname}}
  .{{=classname}}{
    left: 50%;
    margin-left: -{{=it.halfOfMaxWidth}}px;   /* 50% */
    min-width: {{=it.maxWidth}}px;
  }
  {{~}}
}
