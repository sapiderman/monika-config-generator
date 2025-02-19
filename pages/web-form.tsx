import { useRouter } from 'next/router';
import { FormEvent, useContext, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { Button, HeadPage, Layout, TextInput } from '../components';
import { ProbeContext } from '../contexts/probe-context';

export default function WebForm(): JSX.Element {
  const router = useRouter();
  const { probeData, handleSetProbes } = useContext(ProbeContext);
  const probeRequestsFromContext = probeData?.map((probe) => ({
    id: probe.id,
    url: probe?.requests[0]?.url,
    body: probe?.requests[0]?.body,
  }));
  const firstProbeRequestFromContext = probeRequestsFromContext[0];
  const bodyFromContext = Object.keys(firstProbeRequestFromContext?.body).map(
    (bodyKey) => ({
      id: uuid(),
      name: bodyKey,
      value: (firstProbeRequestFromContext?.body as any)[bodyKey],
    })
  );

  const [url, setUrl] = useState(firstProbeRequestFromContext?.url || '');
  const [formData, setFormData] = useState(
    bodyFromContext || [{ id: uuid(), name: '', value: '' }]
  );

  const addInputField = () => {
    setFormData((fd) => [...fd, { id: uuid(), name: '', value: '' }]);
  };
  const removeInputField = (id: string) => {
    setFormData((fd) => fd.filter((r) => r.id !== id));
  };
  const handleFormDataChange = (id: string, key: string, value: string) => {
    setFormData((fd) =>
      fd.map((data) => {
        if (data.id === id) {
          return { ...data, [key]: value };
        }
        return data;
      })
    );
  };
  const handleNext = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body: any = {};

    Object.values(formData)
      .filter((fd) => fd.name)
      .forEach((fd) => (body[fd.name] = fd.value));

    const probeRequestURL = new URL(url);
    const probeRequestName = probeRequestURL.hostname.replaceAll('.', '_');

    handleSetProbes([
      {
        id: uuid(),
        name: probeRequestName,
        interval: 10,
        requests: [
          {
            url,
            body,
            timeout: 10000,
            method: 'POST',
          },
        ],
        incidentThreshold: 5,
        recoveryThreshold: 5,
        alerts: [],
      },
    ]);

    router.push('/notifications');
  };

  return (
    <Layout>
      <HeadPage subtitle="Add web form data" />
      <div className="lg:py-20 xl:py-32 xl:px-80">
        <form className="text-sm sm:text-lg" onSubmit={handleNext}>
          <fieldset>
            <div className="space-y-8 mb-10">
              <p>What is the address (URL) of the web form?</p>
              <TextInput
                id="url"
                onChange={(e) => setUrl(e.target.value)}
                value={url}
                type="url"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <p className="mb-6">What are the data to send?</p>
              {formData.map((formDatum) => {
                const { id, name, value } = formDatum;

                return (
                  <div key={id} className="flex space-x-7 mb-6">
                    <div className="flex-1">
                      <TextInput
                        id={`data${id}-name`}
                        label="Name"
                        onChange={(e) =>
                          handleFormDataChange(id, 'name', e.target.value)
                        }
                        value={name}
                      />
                    </div>
                    <div className="flex-1">
                      <TextInput
                        id={`data${id}-value`}
                        label="Value"
                        onChange={(e) =>
                          handleFormDataChange(id, 'value', e.target.value)
                        }
                        value={value}
                      />
                    </div>
                    <div className="self-end py-3">
                      <button
                        type="button"
                        className="cursor-pointer underline focus:outline-none"
                        onClick={() => removeInputField(id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                className="cursor-pointer underline focus:outline-none"
                type="button"
                onClick={addInputField}>
                Add more data
              </button>
            </div>
          </fieldset>
          <div className="mt-12 py-3 space-x-7">
            <Button type="button" outline onClick={() => router.back()}>
              Back
            </Button>
            <Button type="submit">Next</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
